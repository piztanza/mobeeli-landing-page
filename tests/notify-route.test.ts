import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/notify/route";
import { logBuyerSignupToNotion } from "@/lib/notion/buyerSignups";
import { addBuyerContact, notifyBuyerFallback } from "@/lib/notify/audience";
import { checkNotifyRateLimit, resetNotifyRateLimit } from "@/lib/notify/rateLimit";

vi.mock("@/lib/notify/audience", () => ({
  addBuyerContact: vi.fn().mockResolvedValue(undefined),
  notifyBuyerFallback: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/notion/buyerSignups", () => ({
  logBuyerSignupToNotion: vi.fn().mockResolvedValue({ status: "skipped" }),
}));

let ipCounter = 0;

/** Each test gets its own IP so the per-IP rate limiter never bleeds across tests. */
function post(
  body: unknown,
  ip = `10.3.0.${++ipCounter}`,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  return POST(
    new Request("http://localhost/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
        ...extraHeaders,
      },
      body: JSON.stringify(body),
    }),
  );
}

const validRequest = { email: "buyer@example.com", lang: "en", _honeypot: "" };

describe("POST /api/notify (F-015)", () => {
  beforeEach(() => {
    resetNotifyRateLimit();
    vi.mocked(addBuyerContact).mockClear();
    vi.mocked(addBuyerContact).mockResolvedValue(undefined);
    vi.mocked(notifyBuyerFallback).mockClear();
    vi.mocked(notifyBuyerFallback).mockResolvedValue(undefined);
    vi.mocked(logBuyerSignupToNotion).mockClear();
    vi.mocked(logBuyerSignupToNotion).mockResolvedValue({ status: "skipped" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds the buyer contact and returns 200 for a valid request", async () => {
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(addBuyerContact).toHaveBeenCalledTimes(1);
    expect(addBuyerContact).toHaveBeenCalledWith("buyer@example.com");
    expect(notifyBuyerFallback).not.toHaveBeenCalled();
  });

  it("logs the signup to Notion as on-list, with the receipt time and edge country", async () => {
    await post(validRequest, "10.9.8.7", { "x-vercel-ip-country": "ID" });
    expect(logBuyerSignupToNotion).toHaveBeenCalledTimes(1);
    expect(logBuyerSignupToNotion).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@example.com" }),
      expect.objectContaining({
        country: "ID",
        onMailingList: true,
        receivedAtIso: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    );
  });

  it("still returns 200 when Notion logging fails", async () => {
    vi.mocked(logBuyerSignupToNotion).mockResolvedValue({ status: "failed", reason: "404" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    expect(console.error).toHaveBeenCalledWith(
      "notify: failed to log the buyer signup to Notion",
      "404",
    );
  });

  it("rejects invalid payloads with 400 and never captures", async () => {
    expect((await post({ ...validRequest, email: "nope" })).status).toBe(400);
    expect((await post({ ...validRequest, email: "" })).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect((await post(null)).status).toBe(400);
    expect(addBuyerContact).not.toHaveBeenCalled();
    expect(logBuyerSignupToNotion).not.toHaveBeenCalled();
  });

  it("returns a silent fake 200 for a filled honeypot without capturing", async () => {
    const res = await post({ ...validRequest, _honeypot: "http://spam.example" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(addBuyerContact).not.toHaveBeenCalled();
    expect(notifyBuyerFallback).not.toHaveBeenCalled();
    expect(logBuyerSignupToNotion).not.toHaveBeenCalled();
  });

  it("falls back to the alert email (still 200) when the contact cannot be added", async () => {
    vi.mocked(addBuyerContact).mockRejectedValueOnce(new Error("0 audiences"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(notifyBuyerFallback).toHaveBeenCalledWith("buyer@example.com", "0 audiences", undefined);
    expect(console.error).toHaveBeenCalledWith(
      "notify: failed to add buyer contact to the Resend audience",
      expect.anything(),
    );
  });

  it("flags the Notion row as needing a manual add, and links it in the fallback email", async () => {
    vi.mocked(addBuyerContact).mockRejectedValueOnce(new Error("0 audiences"));
    vi.mocked(logBuyerSignupToNotion).mockResolvedValue({
      status: "logged",
      url: "https://notion.so/buyer-row",
      id: "row-1",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await post(validRequest);
    expect(logBuyerSignupToNotion).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ onMailingList: false }),
    );
    expect(notifyBuyerFallback).toHaveBeenCalledWith(
      "buyer@example.com",
      "0 audiences",
      "https://notion.so/buyer-row",
    );
  });

  it("returns a retriable 500 when Resend fails both ways and Notion has no copy", async () => {
    vi.mocked(addBuyerContact).mockRejectedValueOnce(new Error("resend down"));
    vi.mocked(notifyBuyerFallback).mockRejectedValueOnce(new Error("alert down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "capture_failed" });
  });

  it("stays 200 when Resend fails both ways but the Notion row holds the address", async () => {
    vi.mocked(addBuyerContact).mockRejectedValueOnce(new Error("resend down"));
    vi.mocked(notifyBuyerFallback).mockRejectedValueOnce(new Error("alert down"));
    vi.mocked(logBuyerSignupToNotion).mockResolvedValue({
      status: "logged",
      url: "https://notion.so/buyer-row",
      id: "row-1",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("rate-limits an IP to 10 requests per hour", async () => {
    const ip = "10.4.4.4";
    for (let i = 0; i < 10; i++) {
      expect((await post(validRequest, ip)).status).toBe(200);
    }
    expect((await post(validRequest, ip)).status).toBe(429);
    // A different IP is unaffected.
    expect((await post(validRequest, "10.4.4.5")).status).toBe(200);
  });

  it("rate-limit window is one hour", () => {
    resetNotifyRateLimit();
    const start = 1_800_000_000_000;
    for (let i = 0; i < 10; i++) {
      expect(checkNotifyRateLimit("ip", start + i)).toBe(true);
    }
    expect(checkNotifyRateLimit("ip", start + 3_599_999)).toBe(false);
    // The window resets after an hour.
    expect(checkNotifyRateLimit("ip", start + 3_600_000)).toBe(true);
  });
});

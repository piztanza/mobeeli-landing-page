import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/notify/route";
import { addBuyerContact, notifyBuyerFallback } from "@/lib/notify/audience";
import { checkNotifyRateLimit, resetNotifyRateLimit } from "@/lib/notify/rateLimit";

vi.mock("@/lib/notify/audience", () => ({
  addBuyerContact: vi.fn().mockResolvedValue(undefined),
  notifyBuyerFallback: vi.fn().mockResolvedValue(undefined),
}));

let ipCounter = 0;

/** Each test gets its own IP so the per-IP rate limiter never bleeds across tests. */
function post(body: unknown, ip = `10.3.0.${++ipCounter}`): Promise<Response> {
  return POST(
    new Request("http://localhost/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
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

  it("rejects invalid payloads with 400 and never captures", async () => {
    expect((await post({ ...validRequest, email: "nope" })).status).toBe(400);
    expect((await post({ ...validRequest, email: "" })).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect((await post(null)).status).toBe(400);
    expect(addBuyerContact).not.toHaveBeenCalled();
  });

  it("returns a silent fake 200 for a filled honeypot without capturing", async () => {
    const res = await post({ ...validRequest, _honeypot: "http://spam.example" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(addBuyerContact).not.toHaveBeenCalled();
    expect(notifyBuyerFallback).not.toHaveBeenCalled();
  });

  it("falls back to the alert email (still 200) when the contact cannot be added", async () => {
    vi.mocked(addBuyerContact).mockRejectedValueOnce(new Error("0 audiences"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(notifyBuyerFallback).toHaveBeenCalledWith("buyer@example.com", "0 audiences");
    expect(console.error).toHaveBeenCalledWith(
      "notify: failed to add buyer contact to the Resend audience",
      expect.anything(),
    );
  });

  it("returns a retriable 500 only when the fallback ALSO fails", async () => {
    vi.mocked(addBuyerContact).mockRejectedValueOnce(new Error("resend down"));
    vi.mocked(notifyBuyerFallback).mockRejectedValueOnce(new Error("alert down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "capture_failed" });
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

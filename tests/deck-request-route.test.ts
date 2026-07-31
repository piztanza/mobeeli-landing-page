import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/deck-request/route";
import { resetDeckRequestRateLimit, checkDeckRequestRateLimit } from "@/lib/deck/rateLimit";
import { notifyDeckRequest } from "@/lib/email/deckRequest";
import { logDeckRequestToNotion } from "@/lib/notion/deckRequests";

vi.mock("@/lib/email/deckRequest", () => ({
  notifyDeckRequest: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/notion/deckRequests", () => ({
  logDeckRequestToNotion: vi.fn().mockResolvedValue({ status: "skipped" }),
}));

let ipCounter = 0;

/** Each test gets its own IP so the per-IP rate limiter never bleeds across tests. */
function post(
  body: unknown,
  ip = `10.1.0.${++ipCounter}`,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  return POST(
    new Request("http://localhost/api/deck-request", {
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

const validRequest = {
  name: "Ada Lovelace",
  firm: "Analytical Capital",
  email: "ada@fund.com",
  linkedin: "https://linkedin.com/in/ada",
  message: "Intro via the landing page.",
  lang: "en",
  _honeypot: "",
};

describe("POST /api/deck-request (F-016)", () => {
  beforeEach(() => {
    resetDeckRequestRateLimit();
    vi.mocked(notifyDeckRequest).mockClear();
    vi.mocked(notifyDeckRequest).mockResolvedValue(undefined);
    vi.mocked(logDeckRequestToNotion).mockClear();
    vi.mocked(logDeckRequestToNotion).mockResolvedValue({ status: "skipped" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("alerts the team and returns 200 for a valid request", async () => {
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(notifyDeckRequest).toHaveBeenCalledTimes(1);
    expect(notifyDeckRequest).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada Lovelace", firm: "Analytical Capital" }),
      { status: "skipped" },
    );
  });

  it("logs every accepted request to Notion with the receipt time and edge country", async () => {
    await post(validRequest, "10.9.9.9", { "x-vercel-ip-country": "ID" });
    expect(logDeckRequestToNotion).toHaveBeenCalledTimes(1);
    expect(logDeckRequestToNotion).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada Lovelace", email: "ada@fund.com" }),
      expect.objectContaining({
        country: "ID",
        receivedAtIso: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    );
  });

  it("passes the Notion outcome into the alert email so the founders see it there", async () => {
    vi.mocked(logDeckRequestToNotion).mockResolvedValue({
      status: "logged",
      url: "https://notion.so/row",
      id: "row-1",
    });
    await post(validRequest);
    expect(notifyDeckRequest).toHaveBeenCalledWith(expect.anything(), {
      status: "logged",
      url: "https://notion.so/row",
      id: "row-1",
    });
  });

  it("still succeeds (and still emails) when Notion logging fails", async () => {
    vi.mocked(logDeckRequestToNotion).mockResolvedValue({ status: "failed", reason: "404" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    expect(notifyDeckRequest).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith("deck-request: failed to log to Notion", "404");
  });

  it("rejects invalid payloads with 400 and never alerts or logs", async () => {
    expect((await post({ ...validRequest, name: "" })).status).toBe(400);
    expect((await post({ ...validRequest, firm: "" })).status).toBe(400);
    expect((await post({ ...validRequest, email: "nope" })).status).toBe(400);
    expect((await post(null)).status).toBe(400);
    expect(notifyDeckRequest).not.toHaveBeenCalled();
    expect(logDeckRequestToNotion).not.toHaveBeenCalled();
  });

  it("returns a silent fake 200 for a filled honeypot without alerting or logging", async () => {
    const res = await post({ ...validRequest, _honeypot: "http://spam.example" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(notifyDeckRequest).not.toHaveBeenCalled();
    expect(logDeckRequestToNotion).not.toHaveBeenCalled();
  });

  it("returns a retriable 500 when the alert email fails (email-only flow, nothing stored)", async () => {
    vi.mocked(notifyDeckRequest).mockRejectedValueOnce(new Error("resend down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validRequest);
    expect(res.status).toBe(500);
    expect(console.error).toHaveBeenCalledWith(
      "deck-request: failed to send team alert",
      expect.anything(),
    );
  });

  it("rate-limits an IP to 5 requests per hour", async () => {
    const ip = "10.2.2.2";
    for (let i = 0; i < 5; i++) {
      expect((await post(validRequest, ip)).status).toBe(200);
    }
    expect((await post(validRequest, ip)).status).toBe(429);
    // A different IP is unaffected.
    expect((await post(validRequest, "10.2.2.3")).status).toBe(200);
  });

  it("rate-limit window is one hour", () => {
    resetDeckRequestRateLimit();
    const start = 1_800_000_000_000;
    for (let i = 0; i < 5; i++) {
      expect(checkDeckRequestRateLimit("ip", start + i)).toBe(true);
    }
    expect(checkDeckRequestRateLimit("ip", start + 3_599_999)).toBe(false);
    // The window resets after an hour.
    expect(checkDeckRequestRateLimit("ip", start + 3_600_000)).toBe(true);
  });
});

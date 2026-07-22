import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/deck-request/route";
import { resetDeckRequestRateLimit, checkDeckRequestRateLimit } from "@/lib/deck/rateLimit";
import { notifyDeckRequest } from "@/lib/email/deckRequest";

vi.mock("@/lib/email/deckRequest", () => ({
  notifyDeckRequest: vi.fn().mockResolvedValue(undefined),
}));

let ipCounter = 0;

/** Each test gets its own IP so the per-IP rate limiter never bleeds across tests. */
function post(body: unknown, ip = `10.1.0.${++ipCounter}`): Promise<Response> {
  return POST(
    new Request("http://localhost/api/deck-request", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
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
    );
  });

  it("rejects invalid payloads with 400 and never alerts", async () => {
    expect((await post({ ...validRequest, name: "" })).status).toBe(400);
    expect((await post({ ...validRequest, firm: "" })).status).toBe(400);
    expect((await post({ ...validRequest, email: "nope" })).status).toBe(400);
    expect((await post(null)).status).toBe(400);
    expect(notifyDeckRequest).not.toHaveBeenCalled();
  });

  it("returns a silent fake 200 for a filled honeypot without alerting", async () => {
    const res = await post({ ...validRequest, _honeypot: "http://spam.example" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(notifyDeckRequest).not.toHaveBeenCalled();
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

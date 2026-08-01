import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/waitlist/route";
import { logSellerWaitlistToNotion } from "@/lib/notion/sellerWaitlist";
import { resetRateLimit } from "@/lib/waitlist/rateLimit";

vi.mock("@/lib/notion/sellerWaitlist", () => ({
  logSellerWaitlistToNotion: vi.fn().mockResolvedValue({ status: "skipped" }),
}));

let tempDir: string;
let fallbackFile: string;
let ipCounter = 0;

/** Each test gets its own IP so the per-IP rate limiter never bleeds across tests. */
function post(
  body: unknown,
  ip = `10.0.0.${++ipCounter}`,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  return POST(
    new Request("http://localhost/api/waitlist", {
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

/** Platform-shaped payload (mirrors /api/partners/signup). */
const validLead = {
  partnerType: "GARAGE",
  businessName: "Bengkel Sumber Rejeki",
  contactName: "Budi",
  email: "budi@example.com",
  whatsappNumber: "+62 812 3456 789",
  city: "Jakarta",
  monthlyOrderVolume: "10-50",
  currentToolsUsed: ["Excel", "WhatsApp Order"],
  interestedInNet30: true,
  lang: "id",
  _honeypot: "",
};

describe("POST /api/waitlist", () => {
  beforeEach(async () => {
    resetRateLimit();
    tempDir = await mkdtemp(path.join(tmpdir(), "waitlist-test-"));
    fallbackFile = path.join(tempDir, "leads.jsonl");
    vi.stubEnv("WAITLIST_FALLBACK_FILE", fallbackFile);
    // No DATABASE_URL / RESEND_API_KEY: JSONL fallback path, email alert fails.
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("RESEND_API_KEY", "");
    // The route logs the (expected) email failure — keep test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(logSellerWaitlistToNotion).mockClear();
    vi.mocked(logSellerWaitlistToNotion).mockResolvedValue({ status: "skipped" });
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(tempDir, { recursive: true, force: true });
  });

  it("persists a valid lead to the JSONL fallback (partner_signups field names) before returning 200", async () => {
    const res = await post(validLead);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    const lines = (await readFile(fallbackFile, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(1);
    const stored = JSON.parse(lines[0]);
    // Same field names as the DB insert row.
    expect(stored.partnerType).toBe("GARAGE");
    expect(stored.businessName).toBe("Bengkel Sumber Rejeki");
    expect(stored.currentToolsUsed).toEqual(["Excel", "WhatsApp Order"]);
    expect(stored.brandsCarried).toEqual([]);
    expect(stored.source).toBe("LANDING_MOBEELI_COM");
    expect(stored.id).toBeTruthy();
    expect(stored.updatedAt).toBeTruthy();
    // Landing-only / platform-owned fields never make it into the record.
    expect(stored.lang).toBeUndefined();
    expect(stored._honeypot).toBeUndefined();
    expect(stored.status).toBeUndefined();
    expect(stored.createdAt).toBeUndefined();
  });

  it("still returns 200 when the email alert fails after a successful persist, and logs it", async () => {
    const res = await post(validLead);
    expect(res.status).toBe(200);
    expect(existsSync(fallbackFile)).toBe(true);
    expect(console.error).toHaveBeenCalledWith(
      "waitlist: lead stored but email alert failed",
      expect.anything(),
    );
  });

  it("mirrors the stored lead into Notion with the receipt time and edge country", async () => {
    await post(validLead, "10.7.7.7", { "x-vercel-ip-country": "ID" });
    expect(logSellerWaitlistToNotion).toHaveBeenCalledTimes(1);
    expect(logSellerWaitlistToNotion).toHaveBeenCalledWith(
      expect.objectContaining({ businessName: "Bengkel Sumber Rejeki", partnerType: "GARAGE" }),
      expect.objectContaining({
        country: "ID",
        storedInPlatformDb: true,
        receivedAtIso: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    );
  });

  /**
   * The 2026-08-01 outage: Neon went read-only, every insert threw, and the
   * lead evaporated — 500, no row, no email, nothing to replay. The capture
   * now runs anyway, flagged for replay, while the visitor still gets the
   * retriable 500 that tells the truth about partner_signups.
   */
  describe("when the platform insert fails", () => {
    beforeEach(() => {
      // Parent path is a FILE, so persistLead's mkdir throws — a real failure,
      // no mocking of the module under test.
      vi.stubEnv("WAITLIST_FALLBACK_FILE", path.join(fallbackFile, "leads.jsonl"));
    });

    it("captures the lead in Notion flagged for replay, and still returns 500", async () => {
      await writeFile(fallbackFile, "");
      const res = await post(validLead);

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({ error: "persist_failed" });
      expect(logSellerWaitlistToNotion).toHaveBeenCalledWith(
        expect.objectContaining({ businessName: "Bengkel Sumber Rejeki" }),
        expect.objectContaining({ storedInPlatformDb: false }),
      );
      expect(console.error).toHaveBeenCalledWith(
        "waitlist: failed to persist lead",
        expect.anything(),
      );
    });

    it("does not send the team alert for a lead that was never stored", async () => {
      await writeFile(fallbackFile, "");
      await post(validLead);
      expect(console.error).not.toHaveBeenCalledWith(
        "waitlist: lead stored but email alert failed",
        expect.anything(),
      );
    });

    it("shouts when the capture fails too — that is the only path that loses a lead", async () => {
      await writeFile(fallbackFile, "");
      vi.mocked(logSellerWaitlistToNotion).mockResolvedValue({ status: "failed", reason: "404" });
      await post(validLead);
      expect(console.error).toHaveBeenCalledWith(
        "waitlist: LEAD LOST — the insert failed and Notion capture failed too",
        "404",
      );
    });
  });

  it("still returns 200 when Notion logging fails — the lead is already stored", async () => {
    vi.mocked(logSellerWaitlistToNotion).mockResolvedValue({ status: "failed", reason: "404" });
    const res = await post(validLead);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(existsSync(fallbackFile)).toBe(true);
    expect(console.error).toHaveBeenCalledWith(
      "waitlist: lead stored but Notion logging failed",
      "404",
    );
  });

  it("returns a fake success for a filled _honeypot without persisting anything", async () => {
    const res = await post({ ...validLead, _honeypot: "http://spam.example" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(existsSync(fallbackFile)).toBe(false);
    expect(logSellerWaitlistToNotion).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads and unknown whitelist values with 400", async () => {
    expect((await post({ partnerType: "GARAGE" })).status).toBe(400); // no businessName
    expect((await post({ ...validLead, partnerType: "wholesaler" })).status).toBe(400);
    expect((await post({ ...validLead, partnerType: "garage" })).status).toBe(400); // old lowercase shape
    expect((await post({ ...validLead, city: "Gotham" })).status).toBe(400);
    expect((await post({ ...validLead, monthlyOrderVolume: "1000+" })).status).toBe(400);
    expect((await post({ ...validLead, currentToolsUsed: ["SAP"] })).status).toBe(400);
    expect((await post({ ...validLead, email: "not-an-email" })).status).toBe(400);
    expect((await post(null)).status).toBe(400);
    expect(existsSync(fallbackFile)).toBe(false);
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    const ip = "10.9.9.9";
    const spam = { ...validLead, _honeypot: "bot" }; // honeypot: no fs writes
    for (let i = 0; i < 5; i++) {
      expect((await post(spam, ip)).status).toBe(200);
    }
    const blocked = await post(spam, ip);
    expect(blocked.status).toBe(429);
    // A different IP is unaffected.
    expect((await post(spam, "10.9.9.10")).status).toBe(200);
  });
});

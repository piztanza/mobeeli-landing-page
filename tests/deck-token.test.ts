import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { deckSecret, mintDeckToken, verifyDeckToken } from "@/lib/deck/token";

const SECRET = "test-deck-secret";
const NOW = 1_800_000_000_000;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("deck tokens (F-016)", () => {
  it("mints base64url payload.signature tokens (no +, / or = anywhere)", () => {
    for (const token of [mintDeckToken(NOW + 3_600_000, SECRET), mintDeckToken(null, SECRET)]) {
      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    }
  });

  it("round-trips an expiring token and reports its expiry", () => {
    const expiresAtMs = NOW + 3_600_000;
    const verdict = verifyDeckToken(mintDeckToken(expiresAtMs, SECRET), SECRET, NOW);
    expect(verdict).toEqual({ ok: true, expiresAtMs });
  });

  it("round-trips a non-expiring token (exp null) at any time", () => {
    const token = mintDeckToken(null, SECRET);
    expect(verifyDeckToken(token, SECRET, NOW)).toEqual({ ok: true, expiresAtMs: null });
    // Decades later it still verifies.
    expect(verifyDeckToken(token, SECRET, NOW + 1e12)).toEqual({ ok: true, expiresAtMs: null });
  });

  it("rejects an expired token with reason expired (boundary: exp itself is expired)", () => {
    const token = mintDeckToken(NOW + 1000, SECRET);
    expect(verifyDeckToken(token, SECRET, NOW + 999).ok).toBe(true);
    expect(verifyDeckToken(token, SECRET, NOW + 1000)).toEqual({ ok: false, reason: "expired" });
    expect(verifyDeckToken(token, SECRET, NOW + 1e9)).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects tampered tokens: modified payload, modified signature, wrong secret", () => {
    const token = mintDeckToken(NOW + 3_600_000, SECRET);
    const [payload, signature] = token.split(".");

    // Payload swapped for a forged "never" payload without re-signing.
    const forgedPayload = Buffer.from("v1|never").toString("base64url");
    expect(verifyDeckToken(`${forgedPayload}.${signature}`, SECRET, NOW)).toEqual({
      ok: false,
      reason: "tampered",
    });

    // A flipped signature character.
    const flipped = signature[0] === "A" ? "B" : "A";
    expect(verifyDeckToken(`${payload}.${flipped}${signature.slice(1)}`, SECRET, NOW)).toEqual({
      ok: false,
      reason: "tampered",
    });

    // Signed under a different secret.
    expect(verifyDeckToken(mintDeckToken(null, "other-secret"), SECRET, NOW)).toEqual({
      ok: false,
      reason: "tampered",
    });
  });

  it("rejects malformed tokens", () => {
    for (const bad of ["", "no-dot", "a.b.c", ".sig", "payload.", "!!.??"]) {
      expect(verifyDeckToken(bad, SECRET, NOW).ok).toBe(false);
    }
    // Well-signed but nonsense payloads are malformed, not accepted.
    for (const decoded of ["v2|123", "v1|123|extra", "v1|12.5", "v1|-5", "v1|soon", "v1"]) {
      const payload = Buffer.from(decoded).toString("base64url");
      const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
      expect(verifyDeckToken(`${payload}.${sig}`, SECRET, NOW)).toEqual({
        ok: false,
        reason: "malformed",
      });
    }
  });

  it("deckSecret() reads DECK_SECRET and treats blank as unset", () => {
    vi.stubEnv("DECK_SECRET", "  ");
    expect(deckSecret()).toBeNull();
    vi.stubEnv("DECK_SECRET", "s3cret");
    expect(deckSecret()).toBe("s3cret");
  });
});

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless deck-link tokens (F-016). A token is `<payload>.<signature>` where
 * payload is base64url("v1|<exp>") — exp is the expiry epoch-ms, or "never" for
 * a non-expiring link — and signature is base64url(HMAC-SHA256(DECK_SECRET,
 * payload)). Nothing is stored server-side: possession of an untampered,
 * unexpired token IS the grant. Expiry is enforced server-side on both /deck
 * and /api/deck-file.
 */

const VERSION = "v1";
const NEVER = "never";

/** The DECK_SECRET signing key, or null when not configured (deck routes then reject everything). */
export function deckSecret(): string | null {
  const secret = process.env.DECK_SECRET?.trim();
  return secret ? secret : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Mint a token that expires at `expiresAtMs` (epoch ms), or never when null. */
export function mintDeckToken(expiresAtMs: number | null, secret: string): string {
  if (expiresAtMs !== null && !Number.isFinite(expiresAtMs)) {
    throw new Error("mintDeckToken: expiresAtMs must be a finite epoch-ms number or null");
  }
  const payload = Buffer.from(
    `${VERSION}|${expiresAtMs === null ? NEVER : Math.round(expiresAtMs)}`,
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export type DeckTokenVerdict =
  | { ok: true; expiresAtMs: number | null }
  | { ok: false; reason: "malformed" | "tampered" | "expired" };

/**
 * Verify a token: structure → signature (constant-time) → expiry, in that
 * order, so a tampered token is never reported as merely expired.
 */
export function verifyDeckToken(token: string, secret: string, now = Date.now()): DeckTokenVerdict {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };
  const [payload, signature] = parts;

  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "tampered" };
  }

  const decoded = Buffer.from(payload, "base64url").toString();
  const [version, exp, ...rest] = decoded.split("|");
  if (version !== VERSION || exp === undefined || rest.length > 0) {
    return { ok: false, reason: "malformed" };
  }

  if (exp === NEVER) return { ok: true, expiresAtMs: null };

  const expiresAtMs = Number(exp);
  if (!/^\d+$/.test(exp) || !Number.isFinite(expiresAtMs)) {
    return { ok: false, reason: "malformed" };
  }
  if (now >= expiresAtMs) return { ok: false, reason: "expired" };
  return { ok: true, expiresAtMs };
}

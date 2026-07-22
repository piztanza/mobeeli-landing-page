import { siteUrl } from "@/lib/seo";

import { mintDeckToken } from "./token";

/**
 * Mint model for the founder-only /deck-admin page (F-016). The page itself is
 * gated by DECK_SECRET (`key` query param); these helpers turn the preset /
 * custom-hours query params into a minted, shareable /deck link.
 */

/** Longest custom duration accepted: one year of hours. */
export const MAX_CUSTOM_HOURS = 24 * 365;

export const ONE_HOUR_MS = 3_600_000;

export interface DeckMint {
  token: string;
  /** Full shareable viewer link on the canonical site origin. */
  url: string;
  /** Epoch ms the link stops working, or null for a non-expiring link. */
  expiresAtMs: number | null;
}

/** True when the supplied key matches the configured DECK_SECRET. */
export function deckAdminAuthorized(key: string | undefined, secret: string | null): boolean {
  return secret !== null && typeof key === "string" && key === secret;
}

/** Positive finite custom hours (capped), or null when absent/invalid. */
export function parseCustomHours(raw: string | undefined): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours <= 0) return null;
  return Math.min(hours, MAX_CUSTOM_HOURS);
}

/**
 * Resolve the mint request from query params: preset=1h → one hour, preset=never
 * → non-expiring, hours=N → N hours; anything else mints nothing (the page then
 * only shows the custom-hours form).
 */
export function resolveDeckMint(
  params: { preset?: string; hours?: string },
  secret: string,
  now = Date.now(),
): DeckMint | null {
  let expiresAtMs: number | null | undefined;
  if (params.preset === "1h") {
    expiresAtMs = now + ONE_HOUR_MS;
  } else if (params.preset === "never") {
    expiresAtMs = null;
  } else {
    const hours = parseCustomHours(params.hours);
    if (hours === null) return null;
    expiresAtMs = now + hours * ONE_HOUR_MS;
  }
  const token = mintDeckToken(expiresAtMs, secret);
  return { token, url: deckViewerUrl(token), expiresAtMs };
}

/** Full /deck?token=… link for a minted token. */
export function deckViewerUrl(token: string): string {
  return `${siteUrl()}/deck?token=${encodeURIComponent(token)}`;
}

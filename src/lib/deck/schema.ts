import { z } from "zod";

import { EMAIL_REGEX } from "@/lib/waitlist/schema";

/**
 * Server-side validation for POST /api/deck-request payloads (F-016): name,
 * firm/fund and work email are required; LinkedIn/website and message are
 * optional; honeypot mirrors the waitlist contract. Email-only flow — nothing
 * here is ever written to a database.
 */

/** Optional free text: trimmed, clamped; empty → absent (waitlist idiom). */
const clampedText = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value.slice(0, max)))
    .optional();

export const deckRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.slice(0, 200)),
  firm: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.slice(0, 200)),
  email: z
    .string()
    .trim()
    .regex(EMAIL_REGEX)
    .transform((value) => value.toLowerCase().slice(0, 200)),
  linkedin: clampedText(300),
  message: clampedText(2000),
  /** Picks nothing server-side beyond being reported in the alert email. */
  lang: z.enum(["en", "id"]).default("en"),
  /** Honeypot — non-empty means bot; the route fakes success without alerting. */
  _honeypot: z
    .unknown()
    .optional()
    .transform((value) => (typeof value === "string" ? value : "")),
});

export type DeckRequestPayload = z.infer<typeof deckRequestSchema>;

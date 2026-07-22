import { z } from "zod";

import { EMAIL_REGEX } from "@/lib/waitlist/schema";

/**
 * Server-side validation for POST /api/notify payloads (F-015) — the buyer
 * strip's one-field capture. Unlike the waitlist wizard the email is REQUIRED
 * (it is the only datum); same format check + lowercase/clamp as the waitlist
 * schema so the two endpoints agree on what a valid address is.
 */
export const notifyPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => EMAIL_REGEX.test(value), { message: "invalid email" })
    .transform((value) => value.toLowerCase().slice(0, 200)),
  /** Landing-only: reported in the fallback alert; never sent to Resend contacts. */
  lang: z.enum(["en", "id"]).default("en"),
  /** Honeypot — non-empty means bot; the route fakes success without capturing. */
  _honeypot: z
    .unknown()
    .optional()
    .transform((value) => (typeof value === "string" ? value : "")),
});

export type NotifyPayload = z.infer<typeof notifyPayloadSchema>;

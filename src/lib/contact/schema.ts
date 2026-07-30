import { z } from "zod";

import { EMAIL_REGEX } from "@/lib/waitlist/schema";

/**
 * Server-side validation for POST /api/contact payloads (R30b): name, email
 * and message required; topic is one of the five designed options and lands
 * in the alert subject. Email-only flow — the waitlist table is insert-only
 * for /join and NEVER takes contact messages.
 */

export const CONTACT_TOPICS = ["general", "partnership", "press", "supplier", "investor"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.slice(0, 200)),
  email: z
    .string()
    .trim()
    .regex(EMAIL_REGEX)
    .transform((value) => value.toLowerCase().slice(0, 200)),
  topic: z.enum(CONTACT_TOPICS).default("general"),
  message: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.slice(0, 2000)),
  /** Picks nothing server-side beyond being reported in the alert email. */
  lang: z.enum(["en", "id"]).default("en"),
  /** Honeypot — non-empty means bot; the route fakes success without alerting. */
  _honeypot: z
    .unknown()
    .optional()
    .transform((value) => (typeof value === "string" ? value : "")),
});

export type ContactPayload = z.infer<typeof contactSchema>;

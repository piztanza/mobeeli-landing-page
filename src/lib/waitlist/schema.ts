import { z } from "zod";

import { CITY_OPTIONS, GARAGE_TOOLS, VOLUME_OPTIONS } from "./constants";

/**
 * Server-side validation for POST /api/waitlist payloads (F-008). Mirrors the
 * platform's /api/partners/signup contract: uppercase partnerType enum, only
 * businessName required, email/phone format-checked when present, whitelisted
 * city/volume/tools, arrays clamped to the platform's limits (tools ≤10×60,
 * brands ≤20×60), unknown enum/whitelist values → validation failure (400).
 * lang is landing-only (alert email language) and is never inserted.
 */

export const partnerTypes = ["STORE", "GARAGE", "DISTRIBUTOR"] as const;
export type PartnerType = (typeof partnerTypes)[number];

/* Same expressions as the platform API. */
export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const PHONE_REGEX = /^[+0-9 -]{6,20}$/;

const VOLUME_VALUES: readonly string[] = VOLUME_OPTIONS.map(([value]) => value);

/** Optional free text: trimmed, clamped to the platform's cap; empty → absent. */
const clampedText = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value.slice(0, max)))
    .optional();

/** Optional format-checked field (platform: validate only when non-empty). */
const formatChecked = (regex: RegExp, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || regex.test(value), { message: "invalid format" })
    .transform((value) => (value === "" ? undefined : value.slice(0, max)))
    .optional();

/** Optional whitelist field: empty/absent OK, any other unknown value fails. */
const whitelisted = (values: readonly string[]) =>
  z
    .string()
    .refine((value) => value === "" || values.includes(value), { message: "unknown value" })
    .transform((value) => (value === "" ? undefined : value))
    .optional();

/** Platform cleanList semantics: non-arrays → [], entries trimmed/clamped, list capped. */
const cleanedList = (max: number, perLen: number) =>
  z.unknown().optional().transform((input): string[] => {
    if (!Array.isArray(input)) return [];
    return input
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim().slice(0, perLen))
      .slice(0, max);
  });

export const waitlistPayloadSchema = z.object({
  partnerType: z.enum(partnerTypes),
  businessName: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.slice(0, 200)),
  contactName: clampedText(200),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || EMAIL_REGEX.test(value), { message: "invalid email" })
    .transform((value) => (value === "" ? undefined : value.toLowerCase().slice(0, 200)))
    .optional(),
  contactPhone: formatChecked(PHONE_REGEX, 20),
  whatsappNumber: formatChecked(PHONE_REGEX, 20),
  city: whitelisted(CITY_OPTIONS),
  monthlyOrderVolume: whitelisted(VOLUME_VALUES),
  currentToolsUsed: cleanedList(10, 60).refine(
    (tools) => tools.every((tool) => (GARAGE_TOOLS as readonly string[]).includes(tool)),
    { message: "unknown tool" },
  ),
  brandsCarried: cleanedList(20, 60),
  interestedInNet30: z
    .unknown()
    .optional()
    .transform((value) => value === true),
  message: clampedText(2000),
  /** Landing-only: picks the alert email language; never part of the insert. */
  lang: z.enum(["en", "id"]).default("en"),
  /** Honeypot — non-empty means bot; the route fakes success without persisting. */
  _honeypot: z
    .unknown()
    .optional()
    .transform((value) => (typeof value === "string" ? value : "")),
});

export type WaitlistPayload = z.infer<typeof waitlistPayloadSchema>;

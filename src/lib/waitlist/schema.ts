import { z } from "zod";

/**
 * Server-side validation for POST /api/waitlist payloads (F-008 groundwork).
 * Field set mirrors the approved wizard: only businessName + type are required;
 * contact fields are format-checked when present. Length limits on every field.
 */

export const businessTypes = ["store", "garage", "distributor"] as const;
export type BusinessType = (typeof businessTypes)[number];

/** Optional free-text field with a hard length cap; empty string allowed. */
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const waitlistPayloadSchema = z.object({
  type: z.enum(businessTypes),
  businessName: z.string().trim().min(1).max(200),
  contactName: optionalText(200),
  email: z.union([z.email().max(320), z.literal("")]).optional(),
  phone: optionalText(40),
  whatsappNumber: optionalText(40),
  city: optionalText(120),
  monthlyOrderVolume: optionalText(100),
  toolsUsed: optionalText(500),
  brandsCarried: optionalText(500),
  net30Interest: z.boolean().optional(),
  message: optionalText(2000),
  lang: z.enum(["en", "id"]).default("en"),
  /** Honeypot — must be empty (or absent). Any content marks the submission as spam. */
  website: z.literal("").optional(),
});

export type WaitlistPayload = z.infer<typeof waitlistPayloadSchema>;

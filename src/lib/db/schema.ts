import { boolean, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * partner_signups — the platform's EXISTING production table (F-008). This app
 * NEVER creates or migrates it (no DDL); the model below mirrors the
 * introspected live table verbatim: camelCase quoted columns, Prisma-managed
 * enums and defaults. This landing page only ever INSERTs lead rows — the
 * triage/telemetry columns (utm, sessionId, status, internalNote, reviewedBy,
 * reviewedAt, convertedUserId) belong to the platform and are never written.
 */

export const partnerTypeEnum = pgEnum("PartnerType", ["STORE", "GARAGE", "DISTRIBUTOR"]);

export const partnerSignupStatusEnum = pgEnum("PartnerSignupStatus", [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "REJECTED",
  "SPAM",
]);

export const partnerSignups = pgTable("partner_signups", {
  id: text("id").primaryKey(),
  partnerType: partnerTypeEnum("partnerType").notNull(),
  // Contact — businessName is the only required field on the public form.
  businessName: text("businessName").notNull(),
  contactName: text("contactName"),
  email: text("email"),
  contactPhone: text("contactPhone"),
  whatsappNumber: text("whatsappNumber"),
  city: text("city"),
  // Light qualification
  monthlyOrderVolume: text("monthlyOrderVolume"),
  brandsCarried: text("brandsCarried").array().default([]),
  currentToolsUsed: text("currentToolsUsed").array().default([]),
  interestedInNet30: boolean("interestedInNet30").notNull().default(false),
  message: text("message"),
  // Provenance / telemetry — we send source='LANDING_MOBEELI_COM'; utm/sessionId are the platform's.
  source: text("source").notNull().default("LANDING_PLATFORM"),
  utm: jsonb("utm"),
  sessionId: text("sessionId"),
  // Triage workflow — platform-owned; left to DB defaults / the founding team.
  status: partnerSignupStatusEnum("status").notNull().default("NEW"),
  internalNote: text("internalNote"),
  reviewedBy: text("reviewedBy"),
  reviewedAt: timestamp("reviewedAt", { precision: 3 }),
  convertedUserId: text("convertedUserId"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull(),
});

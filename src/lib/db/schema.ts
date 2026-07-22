import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * waitlist_leads — one row per wizard submission (F-008).
 * Column set mirrors src/lib/waitlist/schema.ts.
 */
export const waitlistLeads = pgTable("waitlist_leads", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number"),
  city: text("city"),
  monthlyOrderVolume: text("monthly_order_volume"),
  toolsUsed: text("tools_used"),
  brandsCarried: text("brands_carried"),
  net30Interest: boolean("net30_interest"),
  message: text("message"),
  lang: text("lang").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

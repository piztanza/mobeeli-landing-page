import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import { getDb } from "@/lib/db/client";
import { partnerSignups } from "@/lib/db/schema";
import { LEAD_SOURCE } from "./constants";
import type { WaitlistPayload } from "./schema";

/** Local fallback target when DATABASE_URL is unset (dev flow); overridable for tests. */
export function fallbackFilePath(): string {
  return (
    process.env.WAITLIST_FALLBACK_FILE ?? path.join(process.cwd(), ".data", "waitlist-leads.jsonl")
  );
}

/**
 * The exact row this app writes to the platform's live partner_signups table:
 * id + updatedAt generated at insert time, source tagged LANDING_MOBEELI_COM,
 * and NOTHING else — status/createdAt stay on their DB defaults; utm,
 * sessionId and the triage columns are platform-owned and never written.
 * lang is deliberately absent (alert-email-only, not a table column).
 */
function buildInsertRow(lead: WaitlistPayload): typeof partnerSignups.$inferInsert {
  return {
    id: crypto.randomUUID(),
    partnerType: lead.partnerType,
    businessName: lead.businessName,
    contactName: lead.contactName ?? null,
    email: lead.email ?? null,
    contactPhone: lead.contactPhone ?? null,
    whatsappNumber: lead.whatsappNumber ?? null,
    city: lead.city ?? null,
    monthlyOrderVolume: lead.monthlyOrderVolume ?? null,
    brandsCarried: lead.brandsCarried,
    currentToolsUsed: lead.currentToolsUsed,
    interestedInNet30: lead.interestedInNet30,
    message: lead.message ?? null,
    source: LEAD_SOURCE,
    updatedAt: new Date(),
  };
}

/**
 * Persists one wizard submission (F-008) — MUST succeed before the client may
 * show success. With DATABASE_URL: drizzle insert into the platform's
 * partner_signups. Without it (local dev): append one JSON line with the SAME
 * field names to .data/waitlist-leads.jsonl so the dev flow works end-to-end
 * with no database.
 */
export async function persistLead(lead: WaitlistPayload): Promise<void> {
  const row = buildInsertRow(lead);
  if (process.env.DATABASE_URL) {
    await getDb().insert(partnerSignups).values(row);
    return;
  }
  const file = fallbackFilePath();
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, JSON.stringify(row) + "\n");
}

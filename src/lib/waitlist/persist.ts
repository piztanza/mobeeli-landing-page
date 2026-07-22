import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import { getDb } from "@/lib/db/client";
import { waitlistLeads } from "@/lib/db/schema";
import type { WaitlistPayload } from "./schema";

/** Local fallback target when DATABASE_URL is unset (dev flow); overridable for tests. */
export function fallbackFilePath(): string {
  return (
    process.env.WAITLIST_FALLBACK_FILE ?? path.join(process.cwd(), ".data", "waitlist-leads.jsonl")
  );
}

/**
 * Persists one wizard submission (F-008) — MUST succeed before the client may
 * show success. With DATABASE_URL: drizzle insert into waitlist_leads. Without
 * it (local dev): append one JSON line to .data/waitlist-leads.jsonl so the
 * dev flow works end-to-end with no database.
 */
export async function persistLead(lead: WaitlistPayload): Promise<void> {
  if (process.env.DATABASE_URL) {
    await getDb()
      .insert(waitlistLeads)
      .values({
        type: lead.type,
        businessName: lead.businessName,
        contactName: lead.contactName || null,
        email: lead.email || null,
        phone: lead.phone || null,
        whatsappNumber: lead.whatsappNumber || null,
        city: lead.city || null,
        monthlyOrderVolume: lead.monthlyOrderVolume || null,
        toolsUsed: lead.toolsUsed || null,
        brandsCarried: lead.brandsCarried || null,
        net30Interest: lead.net30Interest ?? null,
        message: lead.message || null,
        lang: lead.lang,
      });
    return;
  }
  const file = fallbackFilePath();
  await mkdir(path.dirname(file), { recursive: true });
  const record = { ...lead, createdAt: new Date().toISOString() };
  delete record.website; // honeypot marker — never part of the stored lead
  await appendFile(file, JSON.stringify(record) + "\n");
}

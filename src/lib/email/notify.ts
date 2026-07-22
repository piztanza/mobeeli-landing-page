import { Resend } from "resend";

import { LEAD_SOURCE } from "@/lib/waitlist/constants";
import type { WaitlistPayload } from "@/lib/waitlist/schema";

/** Sender for lead alerts; Resend's shared onboarding sender works before a domain is verified. */
const FROM = "Mobeeli Waitlist <onboarding@resend.dev>";

function line(label: string, value: string | undefined | null): string {
  return `${label}: ${value?.trim() ? value.trim() : "—"}`;
}

/**
 * Team notification for new waitlist leads via Resend (F-008): one plain-text
 * email with the lead's details (partner_signups field names + source) to
 * WAITLIST_ALERT_TO per submission. Throws on missing config or send failure —
 * the API route catches and logs, because a failed alert after a successful
 * insert must still return 200. lang picks nothing here beyond being reported;
 * it is alert-only and never inserted.
 * NOTE: templates must never contain exact-fee copy (design copy rule).
 */
export async function notifyNewLead(lead: WaitlistPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — configure it in the server environment.");
  }
  const to = process.env.WAITLIST_ALERT_TO;
  if (!to) {
    throw new Error("WAITLIST_ALERT_TO is not set — configure it in the server environment.");
  }

  const text = [
    line("Partner type", lead.partnerType),
    line("Business name", lead.businessName),
    line("Contact name", lead.contactName),
    line("Email", lead.email),
    line("Contact phone", lead.contactPhone),
    line("WhatsApp", lead.whatsappNumber),
    line("City", lead.city),
    line("Monthly order volume", lead.monthlyOrderVolume),
    line("Current tools used", lead.currentToolsUsed.join(", ")),
    line("Brands carried", lead.brandsCarried.join(", ")),
    line("Net-30 interest", String(lead.interestedInNet30)),
    line("Message", lead.message),
    line("Language", lead.lang),
    line("Source", LEAD_SOURCE),
    line("Received", new Date().toISOString()),
  ].join("\n");

  const { error } = await new Resend(apiKey).emails.send({
    from: FROM,
    to,
    subject: `New waitlist lead — ${lead.businessName}`,
    text,
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

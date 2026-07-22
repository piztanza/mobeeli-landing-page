import { Resend } from "resend";

import type { WaitlistPayload } from "@/lib/waitlist/schema";

/**
 * Team notification for new waitlist leads via Resend.
 * Foundation stub — the notification template and wiring into
 * POST /api/waitlist land with the waitlist backend feature (F-008).
 * NOTE: templates must never contain exact-fee copy (design copy rule).
 */
export async function notifyNewLead(lead: WaitlistPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — configure it in the server environment.");
  }
  // Instantiated here so the client is ready for F-008; sending is not implemented yet.
  void new Resend(apiKey);
  throw new Error(
    `notifyNewLead is not implemented yet (ships with F-008) — lead for "${lead.businessName}" not sent.`,
  );
}

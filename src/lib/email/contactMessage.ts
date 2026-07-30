import { Resend } from "resend";

import type { ContactPayload, ContactTopic } from "@/lib/contact/schema";

/** Sender for contact alerts; same shared onboarding sender as the other flows. */
const FROM = "Mobeeli Contact <onboarding@resend.dev>";

/** EN topic labels — these land in the alert subject (R30b §1). */
const TOPIC_LABELS: Record<ContactTopic, string> = {
  general: "General question",
  partnership: "Partnership",
  press: "Press & media",
  supplier: "Supplier or wholesaler",
  investor: "Investor",
};

function line(label: string, value: string | undefined | null): string {
  return `${label}: ${value?.trim() ? value.trim() : "—"}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface ContactAlert {
  subject: string;
  text: string;
  html: string;
}

/**
 * Alert email for a contact message (R30b). Pure so tests can assert the
 * content without sending anything.
 */
export function contactAlert(payload: ContactPayload): ContactAlert {
  const details = [
    line("Name", payload.name),
    line("Email", payload.email),
    line("Topic", TOPIC_LABELS[payload.topic]),
    line("Language", payload.lang),
    line("Received", new Date().toISOString()),
  ];

  const text = ["New contact message:", "", ...details, "", "Message:", payload.message].join("\n");

  const html = [
    "<h2>New contact message</h2>",
    `<p>${details.map((detail) => escapeHtml(detail)).join("<br/>")}</p>`,
    `<p style="white-space:pre-wrap;">${escapeHtml(payload.message)}</p>`,
  ].join("\n");

  return { subject: `Contact — ${TOPIC_LABELS[payload.topic]}: ${payload.name}`, text, html };
}

/**
 * Send the contact alert to WAITLIST_ALERT_TO via Resend with reply-to set to
 * the sender, so a founder replies from their own address (R30b §4). Throws on
 * missing config or send failure — no persistence fallback, so the API route
 * surfaces a 500 the client can retry.
 */
export async function notifyContactMessage(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — configure it in the server environment.");
  }
  const to = process.env.WAITLIST_ALERT_TO;
  if (!to) {
    throw new Error("WAITLIST_ALERT_TO is not set — configure it in the server environment.");
  }

  const { subject, text, html } = contactAlert(payload);
  const { error } = await new Resend(apiKey).emails.send({
    from: FROM,
    to,
    replyTo: payload.email,
    subject,
    text,
    html,
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

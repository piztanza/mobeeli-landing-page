import { Resend } from "resend";

import type { DeckRequestPayload } from "@/lib/deck/schema";
import { siteUrl } from "@/lib/seo";

/** Sender for deck-request alerts; same shared onboarding sender as the waitlist. */
const FROM = "Mobeeli Deck Requests <onboarding@resend.dev>";

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

/** /deck-admin URL carrying the founder key — no preset; durations are chosen on the page. */
export function deckAdminUrl(secret: string): string {
  const params = new URLSearchParams({ key: secret });
  return `${siteUrl()}/deck-admin?${params.toString()}`;
}

export interface DeckRequestAlert {
  subject: string;
  text: string;
  html: string;
}

/**
 * Alert email for a deck request (F-016): the requester's details plus one
 * mint CTA — a prominent "Generate Deck Link" button pointing at the
 * DECK_SECRET-gated /deck-admin (no preset; the founder picks the duration
 * on the mint page). Pure so tests can assert the content without sending
 * anything.
 */
export function deckRequestAlert(request: DeckRequestPayload, secret: string): DeckRequestAlert {
  const adminUrl = deckAdminUrl(secret);

  const details = [
    line("Name", request.name),
    line("Firm / fund", request.firm),
    line("Email", request.email),
    line("LinkedIn / website", request.linkedin),
    line("Message", request.message),
    line("Language", request.lang),
    line("Received", new Date().toISOString()),
  ];

  const text = [
    "New investor deck request:",
    "",
    ...details,
    "",
    "Generate Deck Link:",
    adminUrl,
  ].join("\n");

  const html = [
    "<h2>New investor deck request</h2>",
    `<p>${details.map((detail) => escapeHtml(detail)).join("<br/>")}</p>`,
    `<p><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#2f7df6;color:#ffffff;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:999px;">Generate Deck Link</a></p>`,
  ].join("\n");

  return { subject: `Deck request — ${request.name} (${request.firm})`, text, html };
}

/**
 * Send the deck-request alert to WAITLIST_ALERT_TO via Resend. Throws on
 * missing config or send failure — unlike the waitlist route there is no
 * database fallback, so the API route surfaces a 500 the client can retry.
 */
export async function notifyDeckRequest(request: DeckRequestPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — configure it in the server environment.");
  }
  const to = process.env.WAITLIST_ALERT_TO;
  if (!to) {
    throw new Error("WAITLIST_ALERT_TO is not set — configure it in the server environment.");
  }
  const secret = process.env.DECK_SECRET?.trim();
  if (!secret) {
    throw new Error("DECK_SECRET is not set — configure it in the server environment.");
  }

  const { subject, text, html } = deckRequestAlert(request, secret);
  const { error } = await new Resend(apiKey).emails.send({ from: FROM, to, subject, text, html });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

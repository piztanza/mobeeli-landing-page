import { Resend } from "resend";

import type { DeckRequestPayload } from "@/lib/deck/schema";
import type { DeckRequestLogResult } from "@/lib/notion/deckRequests";
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

/**
 * /deck-admin URL carrying the founder key — no preset; durations are chosen
 * on the page. When the request reached Notion, its row id rides along as
 * `row` so the mint page can write the sent link straight back to that row.
 */
export function deckAdminUrl(secret: string, rowId?: string): string {
  const params = new URLSearchParams({ key: secret });
  if (rowId) params.set("row", rowId);
  return `${siteUrl()}/deck-admin?${params.toString()}`;
}

export interface DeckRequestAlert {
  subject: string;
  text: string;
  html: string;
}

/**
 * One line about the Notion row, so the founders can see from the email alone
 * that the request was recorded — and, when it wasn't, that this email is the
 * only copy of it. `skipped` (no Notion configured, e.g. local dev) prints
 * nothing.
 */
function notionLine(log: DeckRequestLogResult | undefined): string | null {
  if (!log || log.status === "skipped") return null;
  if (log.status === "logged") return log.url ? `Notion row: ${log.url}` : "Logged to Notion.";
  return `NOT LOGGED TO NOTION — ${log.reason}. This email is the only record; add the row by hand.`;
}

/**
 * Alert email for a deck request (F-016): the requester's details, the Notion
 * row it was logged to, plus one mint CTA — a prominent "Generate Deck Link"
 * button pointing at the DECK_SECRET-gated /deck-admin (no preset; the founder
 * picks the duration on the mint page). Pure so tests can assert the content
 * without sending anything.
 */
export function deckRequestAlert(
  request: DeckRequestPayload,
  secret: string,
  log?: DeckRequestLogResult,
): DeckRequestAlert {
  const adminUrl = deckAdminUrl(secret, log?.status === "logged" ? log.id : undefined);
  const notion = notionLine(log);

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
    ...(notion ? ["", notion] : []),
    "",
    "Generate Deck Link:",
    adminUrl,
  ].join("\n");

  const html = [
    "<h2>New investor deck request</h2>",
    `<p>${details.map((detail) => escapeHtml(detail)).join("<br/>")}</p>`,
    ...(notion
      ? [
          log?.status === "logged" && log.url
            ? `<p><a href="${escapeHtml(log.url)}">Open the Notion row</a></p>`
            : `<p>${escapeHtml(notion)}</p>`,
        ]
      : []),
    `<p><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#2f7df6;color:#ffffff;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:999px;">Generate Deck Link</a></p>`,
  ].join("\n");

  return { subject: `Deck request — ${request.name} (${request.firm})`, text, html };
}

/**
 * Send the deck-request alert to WAITLIST_ALERT_TO via Resend. Throws on
 * missing config or send failure — unlike the waitlist route there is no
 * database fallback, so the API route surfaces a 500 the client can retry.
 */
export async function notifyDeckRequest(
  request: DeckRequestPayload,
  log?: DeckRequestLogResult,
): Promise<void> {
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

  const { subject, text, html } = deckRequestAlert(request, secret, log);
  const { error } = await new Resend(apiKey).emails.send({ from: FROM, to, subject, text, html });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

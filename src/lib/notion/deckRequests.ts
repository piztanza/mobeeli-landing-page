import type { DeckRequestPayload } from "@/lib/deck/schema";

import {
  emailDomain,
  emailType,
  notionCreatePage,
  notionToken,
  notionUpdatePage,
  richText,
  RICH_TEXT_MAX,
} from "./client";

/**
 * Deck-request logging into the founders' Notion "Deck Requests" database
 * (Fundraise teamspace). Every submission of the /investors form becomes one
 * row: who asked, for which firm, when, and the triage columns the founders
 * then manage by hand (Status, Owner, Investor relation, Notes). Deck link
 * sent / Link expires are filled by the write-back below.
 *
 * Best-effort by design. The alert email stays the primary channel, so a
 * Notion outage, a rotated token or an unshared database must never fail the
 * requester's submission — every failure is reported back to the caller and
 * surfaced inside the alert email instead.
 *
 * Server-only config (both documented in .env.example):
 *   NOTION_TOKEN      integration secret, shared with ./client
 *   NOTION_DECK_DB_ID id of the Deck Requests database
 * With either unset (local dev), logging is skipped silently.
 */

/** Request-scoped facts the payload can't get from the form itself. */
export interface DeckRequestContext {
  /** Server receipt time, ISO-8601 — the "Received" column. */
  receivedAtIso: string;
  /** ISO country code from the edge (x-vercel-ip-country), when present. */
  country?: string;
}

export type DeckRequestLogResult =
  /**
   * Row created. `url` is the Notion page (linked from the alert email) and
   * `id` rides along in the email's mint link so /deck-admin can write the
   * sent link back to this exact row.
   */
  | { status: "logged"; url: string; id: string }
  /** NOTION_TOKEN / NOTION_DECK_DB_ID unset: nothing attempted (local dev). */
  | { status: "skipped" }
  /** Attempted and failed — the reason is repeated in the alert email. */
  | { status: "failed"; reason: string };

/**
 * The LinkedIn/website field is free text ("linkedin.com/in/ada"), but Notion's
 * url property wants something URL-shaped — prefix a scheme when it's missing.
 * Absent/blank stays null so the column reads empty rather than "https://".
 */
export function normalizeLink(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * The create-page body for one deck request. Pure, so the column mapping is
 * asserted in tests without touching the network. Column names must match the
 * Deck Requests schema exactly — Notion 400s on an unknown property.
 */
export function deckRequestNotionPage(
  request: DeckRequestPayload,
  context: DeckRequestContext,
  databaseId: string,
): Record<string, unknown> {
  const link = normalizeLink(request.linkedin);

  return {
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: request.name.slice(0, RICH_TEXT_MAX) } }] },
      "Firm / fund": richText(request.firm),
      Email: { email: request.email },
      Received: { date: { start: context.receivedAtIso } },
      // Every row lands in the founders' triage queue as New.
      Status: { select: { name: "New" } },
      "LinkedIn / website": { url: link },
      Message: richText(request.message ?? ""),
      "Email type": { select: { name: emailType(request.email) } },
      "Email domain": richText(emailDomain(request.email)),
      Country: richText(context.country ?? ""),
      Language: { select: { name: request.lang } },
      Source: { select: { name: "Landing — /investors" } },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: request.message?.slice(0, RICH_TEXT_MAX) ?? "(no message)",
              },
            },
          ],
        },
      },
    ],
  };
}

/**
 * Create the row. Resolves with the outcome and never rejects: the caller
 * (POST /api/deck-request) keeps sending the alert email either way, and a
 * "failed" result is printed into that email so no request is silently lost.
 */
export async function logDeckRequestToNotion(
  request: DeckRequestPayload,
  context: DeckRequestContext,
): Promise<DeckRequestLogResult> {
  const token = notionToken();
  const databaseId = process.env.NOTION_DECK_DB_ID?.trim();
  if (!token || !databaseId) return { status: "skipped" };

  const result = await notionCreatePage(token, deckRequestNotionPage(request, context, databaseId));
  if (!result.ok) return { status: "failed", reason: result.reason };
  return { status: "logged", url: result.value.url, id: result.value.id };
}

/** What /deck-admin writes back after minting a link for a request. */
export interface DeckLinkSent {
  /** The full /deck?token=… link that was handed to the requester. */
  url: string;
  /** Expiry epoch-ms, or null for a non-expiring link (column left empty). */
  expiresAtMs: number | null;
}

export type DeckLinkSentResult =
  { status: "saved" } | { status: "skipped" } | { status: "failed"; reason: string };

/**
 * The three columns the founders would otherwise fill in by hand. Pure, so the
 * mapping is asserted without the network.
 */
export function deckLinkSentProperties(record: DeckLinkSent): Record<string, unknown> {
  return {
    "Deck link sent": { url: record.url },
    "Link expires":
      record.expiresAtMs === null
        ? { date: null }
        : { date: { start: new Date(record.expiresAtMs).toISOString() } },
    Status: { select: { name: "Link sent" } },
  };
}

/**
 * Record a minted link on its request row (F-016 + deck-admin write-back):
 * Deck link sent, Link expires and Status → "Link sent". Best-effort like the
 * create path — /deck-admin reports the outcome and the founder can always
 * type it in.
 */
export async function markDeckLinkSent(
  pageId: string,
  record: DeckLinkSent,
): Promise<DeckLinkSentResult> {
  const token = notionToken();
  if (!token || !pageId) return { status: "skipped" };

  const result = await notionUpdatePage(token, pageId, deckLinkSentProperties(record));
  return result.ok ? { status: "saved" } : { status: "failed", reason: result.reason };
}

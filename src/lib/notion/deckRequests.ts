import type { DeckRequestPayload } from "@/lib/deck/schema";

/**
 * Deck-request logging into the founders' Notion "Deck Requests" database
 * (Fundraise teamspace). Every submission of the /investors form becomes one
 * row: who asked, for which firm, when, and the triage columns the founders
 * then manage by hand (Status, Deck link sent, Link expires, Owner, Investor
 * relation, Notes).
 *
 * Best-effort by design. The alert email stays the primary channel, so a
 * Notion outage, a rotated token or an unshared database must never fail the
 * requester's submission — every failure is reported back to the caller and
 * surfaced inside the alert email instead.
 *
 * Server-only config (both documented in .env.example):
 *   NOTION_TOKEN      internal-integration secret; the database must be shared
 *                     with that integration or writes 404.
 *   NOTION_DECK_DB_ID id of the Deck Requests database.
 * With either unset (local dev), logging is skipped silently.
 */

/** Notion REST endpoint for page creation — server-side only, never bundled to the client. */
const NOTION_PAGES_ENDPOINT = "https://api.notion.com/v1/pages";

/** Pinned REST version: the payload shape below is written against this one. */
const NOTION_VERSION = "2022-06-28";

/** Bound the call so a hanging Notion never holds the requester's POST open. */
const TIMEOUT_MS = 8_000;

/** Notion rejects rich-text chunks over 2000 characters. */
const RICH_TEXT_MAX = 2_000;

/**
 * Consumer mailboxes: a deck request from one of these is worth a harder look
 * than one from a fund domain. Not a spam signal on its own — angels use them.
 */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.id",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "qq.com",
  "163.com",
]);

/** Request-scoped facts the payload can't get from the form itself. */
export interface DeckRequestContext {
  /** Server receipt time, ISO-8601 — the "Received" column. */
  receivedAtIso: string;
  /** ISO country code from the edge (x-vercel-ip-country), when present. */
  country?: string;
}

export type DeckRequestLogResult =
  /** Row created — `url` is the Notion page, linked from the alert email. */
  | { status: "logged"; url: string }
  /** NOTION_TOKEN / NOTION_DECK_DB_ID unset: nothing attempted (local dev). */
  | { status: "skipped" }
  /** Attempted and failed — the reason is repeated in the alert email. */
  | { status: "failed"; reason: string };

/** Domain part of an already-validated address, lowercased. */
export function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase();
}

/** "Free / personal" for consumer mailboxes, "Work" otherwise. */
export function emailType(email: string): "Work" | "Free / personal" {
  return FREE_EMAIL_DOMAINS.has(emailDomain(email)) ? "Free / personal" : "Work";
}

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

/** Empty stays an empty array — Notion is happier with that than a blank chunk. */
function richText(value: string) {
  const trimmed = value.trim();
  return { rich_text: trimmed ? [{ text: { content: trimmed.slice(0, RICH_TEXT_MAX) } }] : [] };
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
  const token = process.env.NOTION_TOKEN?.trim();
  const databaseId = process.env.NOTION_DECK_DB_ID?.trim();
  if (!token || !databaseId) return { status: "skipped" };

  try {
    const response = await fetch(NOTION_PAGES_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deckRequestNotionPage(request, context, databaseId)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Notion's message names the cause (unshared database, bad token,
      // renamed column) — worth carrying into the alert email verbatim.
      const detail = await response.text().catch(() => "");
      return {
        status: "failed",
        reason: `Notion responded ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`,
      };
    }

    const created: unknown = await response.json().catch(() => null);
    const url =
      created &&
      typeof created === "object" &&
      typeof (created as { url?: unknown }).url === "string"
        ? (created as { url: string }).url
        : "";
    return { status: "logged", url };
  } catch (error) {
    return { status: "failed", reason: error instanceof Error ? error.message : String(error) };
  }
}

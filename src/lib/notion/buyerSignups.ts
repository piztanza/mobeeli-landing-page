import type { NotifyPayload } from "@/lib/notify/schema";

import {
  emailDomain,
  emailType,
  notionCreatePage,
  notionToken,
  richText,
  RICH_TEXT_MAX,
} from "./client";

/**
 * Buyer-signup logging into the "Buyer Signups" database (Mobeeli Company OS →
 * Databases). Every "get notified" submission on the buyer strip becomes one
 * row: the address, when it arrived, where from, and — the column that earns
 * its keep — whether it actually reached the Resend Buyers audience.
 *
 * Before this, a Resend failure was only visible as a fallback email in an
 * inbox. Now "Needs manual add" is a filterable view, so no buyer quietly
 * misses the launch announcement.
 *
 * Best-effort by design: Resend remains the mailing list of record and the
 * signup succeeds whatever Notion does.
 *
 * Server-only config (both documented in .env.example):
 *   NOTION_TOKEN        integration secret, shared with ./client
 *   NOTION_BUYERS_DB_ID id of the Buyer Signups database
 * With either unset (local dev), logging is skipped silently.
 */

/** Signup-scoped facts the payload can't get from the one-field form. */
export interface BuyerSignupContext {
  /** Server receipt time, ISO-8601 — the "Received" column. */
  receivedAtIso: string;
  /** ISO country code from the edge (x-vercel-ip-country), when present. */
  country?: string;
  /** False when the Resend contact create failed — the row says so in orange. */
  onMailingList: boolean;
}

export type BuyerSignupLogResult =
  /** Row created — `url` is linked from the fallback alert when one is sent. */
  | { status: "logged"; url: string; id: string }
  /** NOTION_TOKEN / NOTION_BUYERS_DB_ID unset: nothing attempted (local dev). */
  | { status: "skipped" }
  /** Attempted and failed; the reason is logged, never shown to the buyer. */
  | { status: "failed"; reason: string };

/**
 * The create-page body for one buyer signup. Pure, so the column mapping is
 * asserted in tests without touching the network. Column names must match the
 * Buyer Signups schema exactly — Notion 400s on an unknown property.
 */
export function buyerSignupNotionPage(
  payload: NotifyPayload,
  context: BuyerSignupContext,
  databaseId: string,
): Record<string, unknown> {
  return {
    parent: { database_id: databaseId },
    properties: {
      // The address is the title: it is the only thing the form collects.
      Email: { title: [{ text: { content: payload.email.slice(0, RICH_TEXT_MAX) } }] },
      Received: { date: { start: context.receivedAtIso } },
      Status: { select: { name: "New" } },
      "Mailing list": {
        select: { name: context.onMailingList ? "Added to Resend" : "Needs manual add" },
      },
      Country: richText(context.country ?? ""),
      Language: { select: { name: payload.lang } },
      "Email domain": richText(emailDomain(payload.email)),
      "Email type": { select: { name: emailType(payload.email) } },
      Source: { select: { name: "Landing — buyer strip" } },
    },
  };
}

/**
 * Create the row. Resolves with the outcome and never rejects — POST /api/notify
 * treats this as a third safety net behind the Resend audience and the fallback
 * alert email, never as a reason to fail the buyer's signup.
 */
export async function logBuyerSignupToNotion(
  payload: NotifyPayload,
  context: BuyerSignupContext,
): Promise<BuyerSignupLogResult> {
  const token = notionToken();
  const databaseId = process.env.NOTION_BUYERS_DB_ID?.trim();
  if (!token || !databaseId) return { status: "skipped" };

  const result = await notionCreatePage(token, buyerSignupNotionPage(payload, context, databaseId));
  if (!result.ok) return { status: "failed", reason: result.reason };
  return { status: "logged", url: result.value.url, id: result.value.id };
}

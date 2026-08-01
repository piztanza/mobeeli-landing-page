import type { PartnerType, WaitlistPayload } from "@/lib/waitlist/schema";

import { notionCreatePage, notionToken, richText, RICH_TEXT_MAX } from "./client";

/**
 * Seller-waitlist logging into the "Seller Waitlist" database (Mobeeli Company
 * OS → Databases). Every completed /join wizard becomes one row: the business,
 * its type, contact details, city, volume, tools, brands and message, plus the
 * triage columns the team manages by hand (Status, Owner, Customer relation,
 * Notes).
 *
 * The platform's `partner_signups` table stays the system of record; this is a
 * working copy for follow-up. The **Platform DB** column says which of the two
 * a row is:
 *
 *   Stored              — the insert succeeded; this row mirrors a real record.
 *   Not stored — replay — the insert failed and this row is the ONLY copy of
 *                         the lead. Replay it by hand once the database takes
 *                         writes again.
 *
 * The second case exists because of 2026-08-01: Neon went read-only
 * (`cannot execute INSERT in a read-only transaction`) and every /join signup
 * evaporated — 500 to the visitor, no row, no alert email, nothing to replay.
 * Capturing here costs an occasional duplicate when a visitor retries
 * successfully, which is visible and cheap to merge; losing a lead is neither.
 *
 * Best-effort throughout: nothing here changes what the visitor sees. A failed
 * insert still returns its retriable 500 whether or not this row was written.
 *
 * Server-only config (both documented in .env.example):
 *   NOTION_TOKEN         integration secret, shared with ./client
 *   NOTION_SELLERS_DB_ID id of the Seller Waitlist database
 * With either unset (local dev), logging is skipped silently.
 */

/** Signup-scoped facts the wizard payload doesn't carry. */
export interface SellerWaitlistContext {
  /** Time the signup reached the server, ISO-8601 — the "Received" column. */
  receivedAtIso: string;
  /** ISO country code from the edge (x-vercel-ip-country), when present. */
  country?: string;
  /** False when the partner_signups insert failed — this row is then the only copy. */
  storedInPlatformDb: boolean;
}

export type SellerWaitlistLogResult =
  | { status: "logged"; url: string; id: string }
  /** NOTION_TOKEN / NOTION_SELLERS_DB_ID unset: nothing attempted (local dev). */
  | { status: "skipped" }
  /** Attempted and failed; the lead is already stored, so this is log-only. */
  | { status: "failed"; reason: string };

/** The platform's uppercase enum reads as SHOUTING in a Notion board. */
const TYPE_LABELS: Record<PartnerType, string> = {
  STORE: "Store",
  GARAGE: "Garage",
  DISTRIBUTOR: "Distributor",
};

/** A select property Notion should leave empty when the wizard skipped it. */
function optionalSelect(value: string | undefined) {
  return { select: value ? { name: value } : null };
}

/**
 * The create-page body for one waitlist signup. Pure, so the column mapping is
 * asserted in tests without touching the network. Column names must match the
 * Seller Waitlist schema exactly — Notion 400s on an unknown property.
 */
export function sellerWaitlistNotionPage(
  lead: WaitlistPayload,
  context: SellerWaitlistContext,
  databaseId: string,
): Record<string, unknown> {
  return {
    parent: { database_id: databaseId },
    properties: {
      Business: { title: [{ text: { content: lead.businessName.slice(0, RICH_TEXT_MAX) } }] },
      Type: { select: { name: TYPE_LABELS[lead.partnerType] } },
      "Contact name": richText(lead.contactName ?? ""),
      // Notion clears an email/phone/url property with null, not "".
      Email: { email: lead.email ?? null },
      Phone: { phone_number: lead.contactPhone ?? null },
      WhatsApp: { phone_number: lead.whatsappNumber ?? null },
      City: optionalSelect(lead.city),
      "Monthly orders": optionalSelect(lead.monthlyOrderVolume),
      // Whitelisted by the schema, so every value matches an existing option.
      "Current tools": { multi_select: lead.currentToolsUsed.map((tool) => ({ name: tool })) },
      // Free text, unbounded: a multi-select would breed an option per brand.
      "Brands carried": richText(lead.brandsCarried.join(", ")),
      "Wants Net 30": { checkbox: lead.interestedInNet30 },
      Message: richText(lead.message ?? ""),
      Received: { date: { start: context.receivedAtIso } },
      Status: { select: { name: "New" } },
      "Platform DB": {
        select: { name: context.storedInPlatformDb ? "Stored" : "Not stored — replay" },
      },
      Country: richText(context.country ?? ""),
      Language: { select: { name: lead.lang } },
      Source: { select: { name: "Landing — /join" } },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { text: { content: lead.message?.slice(0, RICH_TEXT_MAX) ?? "(no message)" } },
          ],
        },
      },
    ],
  };
}

/**
 * Create the row. Resolves with the outcome and never rejects — POST
 * /api/waitlist decides the response from the insert alone, so nothing here
 * may change what the client sees.
 */
export async function logSellerWaitlistToNotion(
  lead: WaitlistPayload,
  context: SellerWaitlistContext,
): Promise<SellerWaitlistLogResult> {
  const token = notionToken();
  const databaseId = process.env.NOTION_SELLERS_DB_ID?.trim();
  if (!token || !databaseId) return { status: "skipped" };

  const result = await notionCreatePage(token, sellerWaitlistNotionPage(lead, context, databaseId));
  if (!result.ok) return { status: "failed", reason: result.reason };
  return { status: "logged", url: result.value.url, id: result.value.id };
}

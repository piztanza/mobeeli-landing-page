/**
 * Shared Notion REST plumbing for the landing site's two inbound trackers —
 * Deck Requests (./deckRequests) and Buyer Signups (./buyerSignups).
 *
 * Both write the same way and fail the same way: server-side only, bounded by
 * a timeout, and never throwing. Every call resolves to a NotionCall the
 * feature maps onto its own vocabulary, because in both cases the site's
 * primary channel (an alert email, a Resend audience) must keep working when
 * Notion does not.
 *
 * One integration secret covers both databases: NOTION_TOKEN, with each
 * database shared with that integration (Connections) or writes 404.
 */

/** Notion REST endpoint for pages — server-side only, never bundled to the client. */
const NOTION_PAGES_ENDPOINT = "https://api.notion.com/v1/pages";

/** Pinned REST version: the payload shapes here are written against this one. */
export const NOTION_VERSION = "2022-06-28";

/** Bound the call so a hanging Notion never holds the visitor's POST open. */
const TIMEOUT_MS = 8_000;

/** Notion rejects rich-text chunks over 2000 characters. */
export const RICH_TEXT_MAX = 2_000;

/** The page a successful create resolves to. */
export interface NotionCreated {
  id: string;
  url: string;
}

export type NotionCall<T> = { ok: true; value: T } | { ok: false; reason: string };

/** The integration secret, or null when Notion logging is not configured. */
export function notionToken(): string | null {
  const token = process.env.NOTION_TOKEN?.trim();
  return token ? token : null;
}

/** Empty stays an empty array — Notion is happier with that than a blank chunk. */
export function richText(value: string) {
  const trimmed = value.trim();
  return { rich_text: trimmed ? [{ text: { content: trimmed.slice(0, RICH_TEXT_MAX) } }] : [] };
}

/** Domain part of an already-validated address, lowercased. */
export function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase();
}

/**
 * Consumer mailboxes. On a deck request that is worth a harder look than a
 * fund domain; on a buyer signup it is unremarkable — small workshops run on
 * personal mail. Either way, knowing which is which speeds up triage.
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

/** "Free / personal" for consumer mailboxes, "Work" otherwise. */
export function emailType(email: string): "Work" | "Free / personal" {
  return FREE_EMAIL_DOMAINS.has(emailDomain(email)) ? "Free / personal" : "Work";
}

async function notionFetch(
  url: string,
  method: "POST" | "PATCH",
  token: string,
  body: unknown,
): Promise<NotionCall<unknown>> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Notion's message names the cause (unshared database, bad token,
      // renamed column) — worth carrying to wherever this is reported.
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        reason: `Notion responded ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`,
      };
    }
    return { ok: true, value: await response.json().catch(() => null) };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

/** Create one page. Never throws. */
export async function notionCreatePage(
  token: string,
  body: Record<string, unknown>,
): Promise<NotionCall<NotionCreated>> {
  const result = await notionFetch(NOTION_PAGES_ENDPOINT, "POST", token, body);
  if (!result.ok) return result;

  const created = result.value;
  const field = (name: "url" | "id"): string => {
    const value =
      created && typeof created === "object" ? (created as Record<string, unknown>)[name] : null;
    return typeof value === "string" ? value : "";
  };
  return { ok: true, value: { id: field("id"), url: field("url") } };
}

/** Update one page's properties. Never throws. */
export async function notionUpdatePage(
  token: string,
  pageId: string,
  properties: Record<string, unknown>,
): Promise<NotionCall<null>> {
  const result = await notionFetch(
    `${NOTION_PAGES_ENDPOINT}/${encodeURIComponent(pageId)}`,
    "PATCH",
    token,
    { properties },
  );
  return result.ok ? { ok: true, value: null } : result;
}

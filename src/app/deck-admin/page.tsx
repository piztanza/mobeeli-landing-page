import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CopyButton from "@/components/deck/CopyButton";
import { deckAdminAuthorized, resolveDeckMint } from "@/lib/deck/admin";
import { deckSecret, stripTrackingSuffix } from "@/lib/deck/token";
import { DEFAULT_LANG, t } from "@/lib/i18n";

import { markDeckLinkSentAction } from "./actions";

import "@/components/deck/deck.css";

/** Founder-only — noindex and absent from the sitemap (F-016). */
export const metadata: Metadata = {
  title: t(DEFAULT_LANG, "meta.deckadmin.title"),
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Founder-only deck-link minting page (F-016), gated by DECK_SECRET: a wrong
 * or missing `key` is a plain 404, so the page is indistinguishable from a
 * non-route to anyone without the secret. The alert email's single "Generate
 * Deck Link" button lands here with no preset; durations are chosen on this
 * page (preset=1h / preset=never quick options or the custom-hours form).
 * Output: the full /deck link, its expiry (or "never expires") and a
 * copy button. Strings resolve server-side from the i18n maps.
 *
 * When the email carried a `row` (the request's Notion page), a second button
 * records the minted link back onto that row — see ./actions.ts.
 */
export default async function DeckAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // Mailed links come back with a click-tracking path glued on (Resend/SES).
  const rawKey = first(params.key);
  const key = rawKey === undefined ? undefined : stripTrackingSuffix(rawKey);
  const secret = deckSecret();
  if (!secret || !deckAdminAuthorized(key, secret)) notFound();

  const row = first(params.row);
  const saved = first(params.saved);
  const mint = resolveDeckMint(
    { preset: first(params.preset), hours: first(params.hours) },
    secret,
  );

  return (
    <div className="mb-da">
      <div className="mb-da-card">
        <h1 className="mb-da-h">{t(DEFAULT_LANG, "da_h")}</h1>

        {saved && (
          <div className="mb-da-note" role="status">
            {t(DEFAULT_LANG, saved === "saved" ? "da_notion_saved" : "da_notion_failed")}
          </div>
        )}

        {mint && (
          <div className="mb-da-out">
            <div className="mb-da-label">{t(DEFAULT_LANG, "da_link_label")}</div>
            <div className="mb-da-link">{mint.url}</div>
            <div className="mb-da-expiry">
              {mint.expiresAtMs === null
                ? t(DEFAULT_LANG, "da_never")
                : t(DEFAULT_LANG, "da_expires").replace(
                    "{t}",
                    new Date(mint.expiresAtMs).toUTCString(),
                  )}
            </div>
            <CopyButton
              value={mint.url}
              label={t(DEFAULT_LANG, "da_copy")}
              copiedLabel={t(DEFAULT_LANG, "da_copied")}
            />
            {row && (
              <form action={markDeckLinkSentAction}>
                <input type="hidden" name="key" value={key} />
                <input type="hidden" name="row" value={row} />
                <input type="hidden" name="url" value={mint.url} />
                <input type="hidden" name="expiresAt" value={mint.expiresAtMs ?? ""} />
                <button type="submit" className="mb-da-btn mb-da-btn-notion">
                  {t(DEFAULT_LANG, "da_notion_btn")}
                </button>
              </form>
            )}
          </div>
        )}

        <form className="mb-da-form" action="/deck-admin" method="GET">
          <input type="hidden" name="key" value={key} />
          {row && <input type="hidden" name="row" value={row} />}
          <div className="mb-da-field">
            <label className="mb-da-label" htmlFor="da-hours">
              {t(DEFAULT_LANG, "da_hours_label")}
            </label>
            <input
              id="da-hours"
              className="mb-da-input"
              type="number"
              name="hours"
              min={1}
              step="any"
              required
            />
          </div>
          <button type="submit" className="mb-da-btn">
            {t(DEFAULT_LANG, "da_hours_btn")}
          </button>
        </form>
      </div>
    </div>
  );
}

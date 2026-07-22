import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CopyButton from "@/components/deck/CopyButton";
import { deckAdminAuthorized, resolveDeckMint } from "@/lib/deck/admin";
import { deckSecret } from "@/lib/deck/token";
import { DEFAULT_LANG, t } from "@/lib/i18n";

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
 */
export default async function DeckAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const key = first(params.key);
  const secret = deckSecret();
  if (!secret || !deckAdminAuthorized(key, secret)) notFound();

  const mint = resolveDeckMint({ preset: first(params.preset), hours: first(params.hours) }, secret);

  return (
    <div className="mb-da">
      <div className="mb-da-card">
        <h1 className="mb-da-h">{t(DEFAULT_LANG, "da_h")}</h1>

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
          </div>
        )}

        <form className="mb-da-form" action="/deck-admin" method="GET">
          <input type="hidden" name="key" value={key} />
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

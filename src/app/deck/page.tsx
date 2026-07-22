import type { Metadata } from "next";

import DeckLinkNotice from "@/components/deck/DeckLinkNotice";
import DeckViewer from "@/components/deck/DeckViewer";
import { deckSecret, verifyDeckToken } from "@/lib/deck/token";
import { DEFAULT_LANG, t } from "@/lib/i18n";

/** /deck is noindex and absent from the sitemap (F-016) — private, token-gated. */
export const metadata: Metadata = {
  title: t(DEFAULT_LANG, "meta.deck.title"),
  robots: { index: false, follow: false },
};

/**
 * Hosted deck viewer (F-016). The token is verified server-side here (expiry
 * included) before any viewer markup ships: expired links get the bilingual
 * re-request page, tampered/malformed ones the invalid variant. /api/deck-file
 * re-verifies on every byte fetch, so this page never handles the PDF itself.
 */
export default async function DeckPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const secret = deckSecret();
  if (!secret || typeof token !== "string" || token === "") {
    return <DeckLinkNotice variant="invalid" />;
  }
  const verdict = verifyDeckToken(token, secret);
  if (!verdict.ok) {
    return <DeckLinkNotice variant={verdict.reason === "expired" ? "expired" : "invalid"} />;
  }
  return <DeckViewer token={token} />;
}

"use client";

import Link from "next/link";

import { LanguageProvider, useT } from "@/lib/i18n/LanguageProvider";

import "./deck.css";

export type DeckNoticeVariant = "expired" | "invalid";

/**
 * Friendly bilingual re-request page for dead deck links (F-016): expired
 * links get the "link has expired" copy, tampered/malformed ones the
 * "isn't valid" copy — both point back at /investors to request a fresh link.
 * Bilingual via the site's persisted EN/ID language choice.
 */
function Notice({ variant }: { variant: DeckNoticeVariant }) {
  const t = useT();
  return (
    <div className="mb-deck">
      <div className="mb-deck-gate">
        <h1 className="mb-deck-gate-h">
          {t(variant === "expired" ? "deck_expired_h" : "deck_invalid_h")}
        </h1>
        <p className="mb-deck-gate-p">
          {t(variant === "expired" ? "deck_expired_p" : "deck_invalid_p")}
        </p>
        <Link href="/investors" className="mb-btn-primary-dark mb-deck-gate-cta">
          {t("deck_expired_cta")}
        </Link>
      </div>
    </div>
  );
}

export default function DeckLinkNotice({ variant }: { variant: DeckNoticeVariant }) {
  return (
    <LanguageProvider>
      <Notice variant={variant} />
    </LanguageProvider>
  );
}

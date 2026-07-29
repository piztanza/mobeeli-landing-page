"use client";

import Link from "next/link";
import { useState } from "react";

import { useT } from "@/lib/i18n/LanguageProvider";

import DeckRequestForm from "./DeckRequestForm";

/* FOUNDER_EMAILS moved to ContactSection.tsx (founder ruling 2026-07-29):
   the inboxes live on /contact; this page links there instead. */

/**
 * Investors — dark rounded card. "Request the deck" opens the bilingual
 * deck-request form (F-016, replacing the F-009 deck-request mailto); the
 * founder direct emails stay.
 */
export default function Investors() {
  const t = useT();
  const [formOpen, setFormOpen] = useState(false);
  return (
    <section id="investors" className="mb-section">
      <div data-rev="0" className="mb-inv-card">
        <div className="mb-kicker mb-kicker--accent">{t("inv_kicker")}</div>
        <h2 className="mb-inv-h2">{t("inv_h2")}</h2>
        <p className="mb-inv-p">{t("inv_p")}</p>
        {formOpen ? (
          <DeckRequestForm />
        ) : (
          <div className="mb-inv-ctas">
            <button
              type="button"
              className="mb-btn-primary-dark mb-inv-cta"
              onClick={() => setFormOpen(true)}
            >
              {t("inv_cta")}
            </button>
          </div>
        )}
        <div className="mb-inv-or">
          <span>{t("inv_or")}</span>
          <div className="mb-inv-emails">
            <Link href="/contact">{t("inv_contact_link")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";

import { useT } from "@/lib/i18n/LanguageProvider";

/** Early Adaptors — 3 benefit cards + the waitlist CTA (F-009: routes to /join). */
export default function EarlyAdaptors() {
  const t = useT();
  return (
    <section id="early-adaptor" className="mb-section mb-early">
      <div className="mb-section-inner">
        <div data-rev="0" className="mb-kicker">
          {t("early_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2 mb-h2--early">
          {t("early_h2")}
        </h2>
        <div className="mb-grid3 mb-grid3--early">
          <div data-rev="0" className="mb-early-card">
            <div className="mb-early-badge" aria-hidden>
              AI
            </div>
            <h3 className="mb-early-t">{t("early_f1_t")}</h3>
            <p className="mb-early-d">{t("early_f1_d")}</p>
          </div>
          <div data-rev="1" className="mb-early-card">
            <div className="mb-early-badge mb-early-badge--lg" aria-hidden>
              {"✓"}
            </div>
            <h3 className="mb-early-t">{t("early_f2_t")}</h3>
            <p className="mb-early-d">{t("early_f2_d")}</p>
          </div>
          <div data-rev="2" className="mb-early-card">
            <div className="mb-early-badge" aria-hidden>
              Rp
            </div>
            <h3 className="mb-early-t">{t("early_f3_t")}</h3>
            <p className="mb-early-d">{t("early_f3_d")}</p>
          </div>
        </div>
        <div data-rev="1" className="mb-early-ctawrap">
          <Link href="/join" className="mb-btn-primary-light">
            {t("early_cta")}
          </Link>
          <div className="mb-early-note">{t("early_note")}</div>
        </div>
      </div>
    </section>
  );
}

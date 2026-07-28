"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * /careers (founder request 2026-07-28) — honest pre-launch stance: no
 * invented roles. The page says none are posted and routes interest to the
 * footer's existing public address. Reuses the investor-card surface so the
 * two "talk to us" pages read as one system; copy is DRAFT pending founder
 * stamp.
 */
export default function CareersSection() {
  const t = useT();
  return (
    <section id="careers" className="mb-section">
      <div data-rev="0" className="mb-inv-card">
        <div className="mb-kicker mb-kicker--accent">{t("careers_kicker")}</div>
        <h2 className="mb-inv-h2">{t("careers_h2")}</h2>
        <p className="mb-inv-p">{t("careers_p")}</p>
        <p className="mb-inv-p">{t("careers_open")}</p>
        <div className="mb-inv-or">
          <span>{t("careers_cta")}</span>
          <div className="mb-inv-emails">
            <a href="mailto:info@mobeeli.com">info@mobeeli.com</a>
          </div>
        </div>
      </div>
    </section>
  );
}

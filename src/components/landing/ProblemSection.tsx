"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/** The problem — 3 pain tiles + the Senen market quote. */
export default function ProblemSection() {
  const t = useT();
  return (
    <section id="problem" className="mb-section">
      <div className="mb-section-inner">
        <div data-rev="0" className="mb-kicker">
          {t("prob_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2 mb-h2--prob">
          {t("prob_h2")}
        </h2>
        <div className="mb-grid3">
          <div data-rev="0" className="mb-card">
            <div className="mb-pain-stat">{t("prob_t1_v")}</div>
            <div className="mb-pain-t">{t("prob_t1_t")}</div>
            <div className="mb-pain-l">{t("prob_t1_l")}</div>
          </div>
          <div data-rev="1" className="mb-card">
            <div className="mb-pain-stat">{t("prob_t2_v")}</div>
            <div className="mb-pain-t">{t("prob_t2_t")}</div>
            <div className="mb-pain-l">{t("prob_t2_l")}</div>
          </div>
          <div data-rev="2" className="mb-card">
            <div className="mb-pain-stat">{t("prob_t3_v")}</div>
            <div className="mb-pain-t">{t("prob_t3_t")}</div>
            <div className="mb-pain-l">{t("prob_t3_l")}</div>
            <div className="mb-pain-chip">{t("prob_t3_chip")}</div>
          </div>
        </div>
        <figure data-rev="1" className="mb-quote">
          <div className="mb-quote-mark" aria-hidden>
            {"“"}
          </div>
          <blockquote className="mb-quote-main">{t("quote_main")}</blockquote>
          <div className="mb-quote-en">{t("quote_en")}</div>
          <figcaption className="mb-quote-by">{t("quote_by")}</figcaption>
        </figure>
      </div>
    </section>
  );
}

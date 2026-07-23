"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * The problem, slimmed for the redesigned landing: headline + the Senen
 * market quote. The 3 pain-stat tiles (ProblemStats) moved to /why-mobeeli.
 */
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

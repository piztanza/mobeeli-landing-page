"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * The problem, slimmed for the redesigned landing: headline + the Senen
 * market quote. The 3 pain-stat tiles (ProblemStats) moved to /why-mobeeli.
 */
export default function ProblemSection() {
  const t = useT();
  const words = t("prob_h2").split(" ");

  return (
    <section id="problem" className="mb-section">
      <div className="mb-section-inner">
        {/* Eyebrow kicker retired (audit #1): the illuminated H2 leads the band
            so the page reads as one narrative, not a stack of labelled lists.
            The prob_kicker copy key stays defined (used nowhere is harmless). */}
        <h2 data-rev="0" className="mb-h2 mb-h2--prob">
          {words.map((word, i) => (
            <span
              key={i}
              className="mb-word-illuminate"
              style={{ "--word-i": i } as React.CSSProperties}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
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

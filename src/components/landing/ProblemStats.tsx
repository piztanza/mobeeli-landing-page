"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * The three pain-stat tiles — extracted verbatim from ProblemSection so the
 * data page can host them independently of the slim landing band.
 */
export default function ProblemStats() {
  const t = useT();
  return (
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
  );
}

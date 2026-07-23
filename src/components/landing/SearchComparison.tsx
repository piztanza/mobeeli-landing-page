"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * "Same search, two outcomes" comparison — extracted verbatim from HowItWorks
 * so the data page can host it independently of the slim landing band.
 */
export default function SearchComparison() {
  const t = useT();
  return (
    <div data-rev="1" className="mb-cmp">
      <h3 className="mb-cmp-h">{t("cmp_h")}</h3>
      <div className="mb-cmp-grid">
        <div className="mb-cmp-card">
          <div className="mb-cmp-t">{t("cmp_bad_t")}</div>
          <div className="mb-cmp-rows">
            <div className="mb-cmp-row">
              <span className="mb-cmp-num">1</span>
              <span className="mb-cmp-text">{t("cmp_bad_1")}</span>
            </div>
            <div className="mb-cmp-row">
              <span className="mb-cmp-num">2</span>
              <span className="mb-cmp-text">{t("cmp_bad_2")}</span>
            </div>
            <div className="mb-cmp-row">
              <span className="mb-cmp-num">3</span>
              <span className="mb-cmp-text">{t("cmp_bad_3")}</span>
            </div>
            <div className="mb-cmp-row">
              <span className="mb-cmp-num is-x">{"✗"}</span>
              <span className="mb-cmp-text">{t("cmp_bad_4")}</span>
            </div>
          </div>
          <div className="mb-cmp-res is-bad">{t("cmp_bad_res")}</div>
        </div>
        <div className="mb-cmp-card is-good">
          <div className="mb-cmp-t">{t("cmp_good_t")}</div>
          <div className="mb-cmp-rows">
            <div className="mb-cmp-row">
              <span className="mb-cmp-num">1</span>
              <span className="mb-cmp-text">{t("cmp_good_1")}</span>
            </div>
            <div className="mb-cmp-row">
              <span className="mb-cmp-num">2</span>
              <span className="mb-cmp-text">{t("cmp_good_2")}</span>
            </div>
            <div className="mb-cmp-row">
              <span className="mb-cmp-num">3</span>
              <span className="mb-cmp-text">{t("cmp_good_3")}</span>
            </div>
            <div className="mb-cmp-row">
              <span className="mb-cmp-num is-check">{"✓"}</span>
              <span className="mb-cmp-text">{t("cmp_good_4")}</span>
            </div>
          </div>
          <div className="mb-cmp-res is-good">{t("cmp_good_res")}</div>
        </div>
      </div>
    </div>
  );
}

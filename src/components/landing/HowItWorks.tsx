"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

import SearchComparison from "./SearchComparison";

/** How it works — 3 step cards + the "same search, two outcomes" comparison. */
export default function HowItWorks() {
  const t = useT();
  return (
    <section id="how-it-works" className="mb-section mb-how">
      <div className="mb-section-inner">
        <div data-rev="0" className="mb-kicker">
          {t("how_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2 mb-h2--how">
          {t("how_h2")}
        </h2>
        <div className="mb-grid3">
          <div data-rev="0" className="mb-step-card">
            <div className="mb-step-num">1</div>
            <h3 className="mb-step-t">{t("how_s1_t")}</h3>
            <p className="mb-step-d">{t("how_s1_d")}</p>
            <div className="mb-step-stack">
              <div className="mb-ymm-pill">
                <span className="mb-ymm-k">{t("ymm_y")}</span>
                <span className="mb-ymm-v">{t("ymm_y_v")}</span>
              </div>
              <div className="mb-ymm-pill mb-ymm-pill--1">
                <span className="mb-ymm-k">{t("ymm_mk")}</span>
                <span className="mb-ymm-v">{t("ymm_mk_v")}</span>
              </div>
              <div className="mb-ymm-pill mb-ymm-pill--2">
                <span className="mb-ymm-k">{t("ymm_md")}</span>
                <span className="mb-ymm-v">{t("ymm_md_v")}</span>
              </div>
              <div className="mb-ymm-pill mb-ymm-pill--3 is-active">
                <span className="mb-ymm-k">{t("ymm_tr")}</span>
                <span className="mb-ymm-v">{t("ymm_tr_v")}</span>
              </div>
            </div>
          </div>
          <div data-rev="1" className="mb-step-card">
            <div className="mb-step-num">2</div>
            <h3 className="mb-step-t">{t("how_s2_t")}</h3>
            <p className="mb-step-d">{t("how_s2_d")}</p>
            <div className="mb-step-stack">
              <div className="mb-fit-row">
                <span className="mb-fit-thumb" aria-hidden />
                <span className="mb-fit-label">{t("fit_r1")}</span>
                <span className="mb-fit-mark">{"✓"}</span>
              </div>
              <div className="mb-fit-row">
                <span className="mb-fit-thumb" aria-hidden />
                <span className="mb-fit-label">{t("fit_r2")}</span>
                <span className="mb-fit-mark">{"✓"}</span>
              </div>
              <div className="mb-fit-row is-bad">
                <span className="mb-fit-thumb" aria-hidden />
                <span className="mb-fit-label">{t("fit_r3")}</span>
                <span className="mb-fit-mark">{"✗"}</span>
              </div>
            </div>
          </div>
          <div data-rev="2" className="mb-step-card">
            <div className="mb-step-num">3</div>
            <h3 className="mb-step-t">{t("how_s3_t")}</h3>
            <p className="mb-step-d">{t("how_s3_d")}</p>
            <div className="mb-step-stack">
              <div className="mb-prot-row">{t("prot_r1")}</div>
              <div className="mb-prot-row">{t("prot_r2")}</div>
              <div className="mb-prot-row is-hl">{t("prot_r3")}</div>
            </div>
          </div>
        </div>
        <SearchComparison />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

import { useGlowCards } from "@/lib/hooks/useGlowCards";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * How it works, slimmed for the redesigned landing: the 3 step cards only.
 * Step 2 features the search-funnel narrowing simulator ported from platform
 * (Hypothesis 1, zero framer motion, recolored to Mobeeli blue system).
 * Cards feature Q1 cursor-tracked glow-border system.
 */
export default function HowItWorks() {
  const t = useT();
  const reduced = useReducedMotion();
  const glowRef = useGlowCards<HTMLElement>();
  const [funnelStep, setFunnelStep] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setFunnelStep((prev) => (prev + 1) % 3);
    }, 2400);
    return () => clearInterval(interval);
  }, [reduced]);

  const stepIndex = reduced ? 2 : funnelStep;

  return (
    <section ref={glowRef} id="how-it-works" className="mb-section mb-how">
      <div className="mb-section-inner">
        <div data-rev="0" className="mb-kicker">
          {t("how_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2 mb-h2--how">
          {t("how_h2")}
        </h2>
        <div className="mb-grid3">
          <div data-rev="0" className="mb-step-card mb-glow-card">
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
          <div data-rev="1" className="mb-step-card mb-glow-card">
            <div className="mb-step-num">2</div>
            <h3 className="mb-step-t">{t("how_s2_t")}</h3>
            <p className="mb-step-d">{t("how_s2_d_short")}</p>
            <div className="mb-funnel-sim">
              <div className="mb-funnel-input">
                <span className="mb-funnel-chip">{t("how_s2_fnl_q1")}</span>
                {stepIndex >= 1 && (
                  <span className="mb-funnel-chip">{t("how_s2_fnl_q2")}</span>
                )}
                {stepIndex >= 2 && (
                  <span className="mb-funnel-chip is-active">{t("how_s2_fnl_q3")}</span>
                )}
                <span className="mb-funnel-cursor" aria-hidden />
              </div>
              <div className="mb-funnel-results">
                <div className="mb-funnel-count">
                  <span className={`mb-funnel-num${stepIndex === 2 ? " is-exact" : ""}`}>
                    {stepIndex === 0 && t("how_s2_fnl_c1")}
                    {stepIndex === 1 && t("how_s2_fnl_c2")}
                    {stepIndex === 2 && t("how_s2_fnl_c3")}
                  </span>
                  <span className="mb-funnel-unit">{t("how_s2_fnl_unit")}</span>
                </div>
                {stepIndex === 2 && (
                  <div className="mb-funnel-badge">
                    <span>✓</span>
                    <span>{t("how_s2_fnl_badge")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div data-rev="2" className="mb-step-card mb-glow-card">
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
      </div>
    </section>
  );
}


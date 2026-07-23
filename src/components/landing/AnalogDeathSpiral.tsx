"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * AnalogDeathSpiral — Ported from platform repo (Authorized Port #2)
 * Features 3 margin bleed cards (Cascade node graph, Glitch scanner, C.O.D. Chokehold).
 * Zero framer-motion, fully recolored to Mobeeli blue design system.
 */
export default function AnalogDeathSpiral() {
  const t = useT();
  const reduced = useReducedMotion();
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 800);
    }, 3200);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <div className="mb-deathspiral-grid">
      {/* 1. Markup Cascade Card — node labels are keyed and GENERIC: no real
          manufacturer names on marketing surfaces (audit rule). */}
      <div className="mb-ds-card mb-glow-card">
        <div className="mb-ds-card-head">
          <div className="mb-ds-icon mb-ds-icon--cascade" aria-hidden>
            %
          </div>
          <h3 className="mb-ds-title">{t("why_ds_c1_t")}</h3>
        </div>
        <p className="mb-ds-desc">{t("why_ds_c1_d")}</p>
        <div className="mb-ds-cascade-graph">
          <div className="mb-ds-node mb-ds-node--base">
            <span>{t("why_ds_n_base")}</span>
            <span className="mb-ds-tag">{t("why_ds_n_base_tag")}</span>
          </div>
          <div className="mb-ds-node mb-ds-node--step1">
            <span>{t("why_ds_n1")}</span>
            <span className="mb-ds-badge">+15%</span>
          </div>
          <div className="mb-ds-node mb-ds-node--step2">
            <span>{t("why_ds_n2")}</span>
            <span className="mb-ds-badge">+15%</span>
          </div>
          <div className="mb-ds-node mb-ds-node--step3">
            <span>{t("why_ds_n3")}</span>
            <span className="mb-ds-badge mb-ds-badge--accent">+20%</span>
          </div>
        </div>
      </div>

      {/* 2. Fake Parts Glitch Card */}
      <div className="mb-ds-card mb-glow-card">
        <div className="mb-ds-card-head">
          <div className="mb-ds-icon mb-ds-icon--warning" aria-hidden>
            !
          </div>
          <h3 className="mb-ds-title">{t("why_ds_c2_t")}</h3>
        </div>
        <p className="mb-ds-desc">{t("why_ds_c2_d")}</p>
        <div className="mb-ds-glitch-stage">
          <div className="mb-ds-glitch-header">
            {/* Serial chrome — language-invariant, like PCD / Rp. */}
            <span className="mb-ds-glitch-tag">YMM-SCAN-884</span>
            <span className="mb-dot mb-pulse" aria-hidden />
          </div>
          <div className={`mb-ds-glitch-body${isGlitching ? " is-glitch" : ""}`}>
            {!isGlitching ? (
              <div className="mb-ds-status mb-ds-status--safe">
                <span className="mb-ds-status-icon">{"✓"}</span>
                <span>{t("why_ds_scan_ok")}</span>
              </div>
            ) : (
              <div className="mb-ds-status mb-ds-status--danger">
                <span className="mb-ds-status-icon">{"✗"}</span>
                <span>{t("why_ds_scan_bad")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. C.O.D. Chokehold Card */}
      <div className="mb-ds-card mb-glow-card">
        <div className="mb-ds-card-head">
          <div className="mb-ds-icon mb-ds-icon--lock" aria-hidden>
            Rp
          </div>
          <h3 className="mb-ds-title">{t("why_ds_c3_t")}</h3>
        </div>
        <p className="mb-ds-desc">{t("why_ds_c3_d")}</p>
        <div className="mb-ds-cod-bar">
          <div className="mb-ds-cod-label">{t("why_ds_cod_l")}</div>
          <div className="mb-ds-cod-track">
            <div className="mb-ds-cod-fill" />
            <div className="mb-ds-cod-lock">{t("why_ds_cod_lock")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

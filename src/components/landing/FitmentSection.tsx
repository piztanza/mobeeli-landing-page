"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useT } from "@/lib/i18n/LanguageProvider";

import PlatformFlow from "./PlatformFlow";

import { AURORA_INTENSITY } from "@/components/three/auroraIntensity";

const AmbientAurora = dynamic(() => import("@/components/three/AmbientAurora"), {
  ssr: false,
});

/**
 * How long a scan runs, in ms. The whole CSS choreography
 * (`.mb-cat-car-wrapper.is-scanning …` in landing.css) is authored to this
 * number: the line's acquire/traverse/settle phases are percentages of it, and
 * every callout delay is an absolute position inside it. A contract test asserts
 * the two sides agree, so they can't drift apart again (they were 1800ms vs
 * 1.5s, which cut the pass off mid-travel).
 */
export const SCAN_DURATION_MS = 1800;

/**
 * The merged how-it-works band (R15 catalog + R20 platform flow, merged by
 * R25) — THIRD band in the stack, after the problem band. One headline spans
 * both halves: the industry-scale Sankey figure (PlatformFlow) hands off via a
 * bridge line to the per-part proof — a five-level vehicle picker (YMM +
 * plate/VIN) persisting to a localStorage "garage", beside a catalogue result
 * window with fitment-spec cards, one of which deliberately does not fit.
 *
 * (Earlier versions of this comment described "the second section" and
 * "(Simulation) price tags" — both stale: R16 ruling 2b replaced prices with
 * fitment specs, and R18/R25 reordered and merged the bands. The Simulation
 * label now rides the illustrative result COUNTS, per the founder's 2026-07-28
 * ruling, and a test asserts it renders.) All strings come from copy.ts.
 */
export default function FitmentSection() {
  const t = useT();
  const [year, setYear] = useState("2024");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Avanza");
  const [trim, setTrim] = useState("1.5 G CVT");
  const [isScanning, setIsScanning] = useState(false);

  const [counter, setCounter] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [vin, setVin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const garage = mounted ? localStorage.getItem("mobeeli_garage") : null;

  const saveGarage = (val: string) => {
    localStorage.setItem("mobeeli_garage", val);
    setCounter((c) => c + 1);
  };

  const clearGarage = () => {
    localStorage.removeItem("mobeeli_garage");
    setCounter((c) => c + 1);
  };

  const handleYmmChange = (y: string, m: string, mod: string, tr: string) => {
    setYear(y);
    setMake(m);
    setModel(mod);
    setTrim(tr);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      saveGarage(`${m} ${mod} ${tr} ${y}`);
    }, SCAN_DURATION_MS);
  };

  const handleVinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin) return;
    setIsScanning(true);
    setYear("2019");
    setMake("Toyota");
    setModel("Avanza");
    setTrim("1.5 G CVT");
    setTimeout(() => {
      setIsScanning(false);
      saveGarage("Toyota Avanza 1.5 G CVT 2019");
      setVin("");
    }, SCAN_DURATION_MS);
  };

  // R16 ruling 2b: cards carry a FITMENT SPEC, not a simulated price. `as const`
  // keeps each key a literal CopyKey, so t(part.key) / t(part.spec) typecheck
  // without an unsafe cast.
  // The last entry does NOT fit, deliberately. A catalogue that only ever
  // returns matches proves nothing — showing the one it rejected, and why, is
  // the whole argument. `fits: false` drives the struck-through name and the
  // red chip; it is never gated on `garage`, because a non-match is a result
  // too.
  const parts = [
    {
      key: "cat_part1_name",
      spec: "cat_part1_spec",
      img: "/assets/parts/spark-plug.jpg",
      fits: true,
    },
    { key: "cat_part2_name", spec: "cat_part2_spec", img: "/assets/parts/clutch.jpg", fits: true },
    { key: "cat_part3_name", spec: "cat_part3_spec", img: "/assets/parts/shock.jpg", fits: true },
    {
      key: "cat_part5_name",
      spec: "cat_part5_spec",
      img: "/assets/parts/brake-pad.jpg",
      fits: false,
    },
  ] as const;

  return (
    <section id="how-it-works" className="mb-fit3d mb-section">
      <AmbientAurora intensity={AURORA_INTENSITY} />
      {/* Founder 2026-07-28: the animated bezier-network background is OFF this
          band — the travelling packets and the radiating node read as motion
          for its own sake behind a panel the visitor is meant to read. The
          band keeps AmbientAurora and .mb-fit3d's own radial washes, so it is
          not bare. The component stays in the repo and still renders on
          /why-mobeeli, where its test lives. */}
      <div className="mb-fit3d-inner mb-section-inner">
        {/* One headline for the whole band, full width. R16 ruling 2b: the
            simulated stat tiles (OE specs / applications / models) are gone —
            the landing page is a company profile, not a pitch deck. */}
        <div className="mb-ucat-head">
          <div data-rev="0" className="mb-kicker mb-kicker--accent">
            {t("cat_kicker")}
          </div>
          <h2 data-rev="1" className="mb-h2 mb-h2--fit3d mb-ucat-h2">
            {t("cat_unified_h2")}
          </h2>
          <p data-rev="2" className="mb-ucat-head-p">
            {t("cat_unified_p")}
          </p>
        </div>

        {/* Industry scale: five parties → one platform → five parties. */}
        <PlatformFlow />

        {/* The hand-off from industry scale to per-part proof. */}
        <p className="mb-cat-bridge" data-rev="3">
          {t("cat_bridge")}
        </p>

        {/* Per-part proof: picker left, result right. */}
        <div className="mb-cat-panels">
          <div
            key={counter}
            className="mb-ymm-container mb-cat-ymm mb-glass"
            suppressHydrationWarning
          >
            <div className="mb-step-badge-row">
              {/* The panel's own title. cat_filter_active ("Filter Active") sat
                  here with a database glyph — a leftover from when this was a
                  filter widget rather than a vehicle picker, and not what the
                  design shows. The key stays defined and paired in copy.ts,
                  same precedent as prot_r*. */}
              <label className="mb-ymm-label">{t("cat_picker_title")}</label>
              {/* The count is the point of the panel: five levels, not four.
                  Trim alone does not determine fitment — the engine does. */}
              <span className="mb-ymm-levels">{t("cat_picker_levels")}</span>
            </div>
            {garage && !isScanning ? (
              <div className="mb-garage-active">
                <span className="mb-garage-badge">{t("garage_chip_label")}</span>
                <span className="mb-garage-val">{garage}</span>
                <button onClick={clearGarage} className="mb-garage-clear">
                  {t("garage_chip_clear")}
                </button>
              </div>
            ) : (
              <div className="mb-picker-forms">
                <form onSubmit={handleVinSubmit} className="mb-vin-form">
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder={t("garage_plate_placeholder")}
                    aria-label={t("garage_plate_label")}
                    className="mb-ymm-select mb-vin-input"
                  />
                  <button type="submit" className="mb-vin-btn">
                    {t("garage_plate_btn")}
                  </button>
                </form>
                <div className="mb-ymm-picker">
                  <select
                    value={year}
                    aria-label={t("ymm_year")}
                    className="mb-ymm-select"
                    onChange={(e) => handleYmmChange(e.target.value, make, model, trim)}
                  >
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                  <select
                    value={make}
                    aria-label={t("ymm_make")}
                    className="mb-ymm-select"
                    onChange={(e) => handleYmmChange(year, e.target.value, model, trim)}
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Daihatsu">Daihatsu</option>
                    <option value="Hyundai">Hyundai</option>
                  </select>
                  <select
                    value={model}
                    aria-label={t("ymm_model")}
                    className="mb-ymm-select"
                    onChange={(e) => handleYmmChange(year, make, e.target.value, trim)}
                  >
                    <option value="Avanza">Avanza</option>
                    <option value="Innova Zenix">Innova Zenix</option>
                    <option value="Xpander">Xpander</option>
                    <option value="Xenia">Xenia</option>
                    <option value="Stargazer">Stargazer</option>
                  </select>
                  <select
                    value={trim}
                    aria-label={t("ymm_trim")}
                    className="mb-ymm-select"
                    onChange={(e) => handleYmmChange(year, make, model, e.target.value)}
                  >
                    <option value="1.5 G CVT">1.5 G CVT</option>
                    <option value="2.0 V HEV">2.0 V HEV</option>
                    <option value="1.5 Ultimate">1.5 Ultimate</option>
                    <option value="1.5 R CVT">1.5 R CVT</option>
                    <option value="1.5 Prime">1.5 Prime</option>
                  </select>
                </div>
                {/* The fifth level, and the reason the panel claims five. Shown
                    as a derived chip rather than a sixth control: the engine
                    follows from the trim, so making it selectable would invite
                    a combination that does not exist. */}
                <div className="mb-ymm-engine">
                  <span className="mb-ymm-engine-code">{t("cat_engine_code")}</span>
                  <span className="mb-ymm-engine-note">{t("cat_engine_note")}</span>
                </div>
              </div>
            )}
          </div>

          {/* The architectural claim the picker is evidence for. */}
          <div className="mb-cat-sku mb-t2">
            <span className="mb-cat-sku-kicker mb-t4">{t("cat_sku_kicker")}</span>
            <span className="mb-cat-sku-title">{t("cat_sku_title")}</span>
            <span className="mb-cat-sku-sub">{t("cat_sku_sub")}</span>
          </div>

          {/* The result, framed as the product surface it will appear on. Same
              .mb-glass recipe as the picker so the two read as one instrument.
              `is-scanning` is set here AND on .mb-cat-car-wrapper: both derive
              from one isScanning value in one render, so they cannot disagree,
              and :has() would change specificity under the existing scan rules
              (whose reduced-motion cancel beats the live rule on SOURCE ORDER
              alone — prefixing either side breaks the gate silently). */}
          <div className="mb-cat-window mb-glass">
            <div className="mb-cat-window-bar" aria-hidden>
              <span className="mb-cat-window-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="mb-cat-window-search">
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                {t("cat_search_query")}
              </span>
              <span className="mb-cat-window-title">{t("cat_katalog_label")}</span>
            </div>
            {/* FOUNDER RULING 2026-07-28: illustrative counts, shipped WITH
                cat_sim_tag. R16 ruling 2b had banned simulated figures from this
                band; they return only because they are labelled — the same
                compromise R15 set for the part cards. Do not quietly drop the
                tag: without it the page asserts a measured catalogue size. */}
            <div className="mb-cat-count">
              <span className="mb-cat-count-fit">{t("cat_count_fit")}</span>
              <span className="mb-cat-count-sim">{t("cat_sim_tag")}</span>
              <span className="mb-cat-count-rest">{t("cat_count_hidden")}</span>
              <span className="mb-cat-count-rest">{t("cat_count_ai")}</span>
            </div>
            <div className={`mb-cat-window-body ${isScanning ? "is-scanning" : ""}`}>
              <div className={`mb-cat-car-wrapper ${isScanning ? "is-scanning" : ""}`}>
                <Image
                  src="/assets/fitment/catalog-car-poster.jpg"
                  alt={t("cat_car_alt")}
                  fill
                  sizes="280px"
                  className="mb-cat-car-img"
                />
                <div className="mb-cat-car-grid" />
                {/* R16 §8 (ruling 4a) — the measured readout. The whole layer is
                    aria-hidden: these labels live in the DOM permanently at
                    opacity 0, so exposing them would have a screen reader
                    announce three measurements and a vehicle lock at all times,
                    including at rest. The authoritative result stays in the
                    accessible tree — the garage chip above and the per-card
                    "Verified Fit" badge below. Positions and delays are pure
                    CSS (landing.css), never JS, so nothing can desync from the
                    .is-scanning class. */}
                <div className="mb-cat-scan-readout" aria-hidden>
                  <div className="mb-cat-scan-callout mb-cat-scan-callout--1">
                    <span className="mb-cat-scan-dot" />
                    <span className="mb-cat-scan-leader" />
                    <span className="mb-cat-scan-val">{t("cat_scan_pcd")}</span>
                  </div>
                  <div className="mb-cat-scan-callout mb-cat-scan-callout--2">
                    <span className="mb-cat-scan-dot" />
                    <span className="mb-cat-scan-leader" />
                    <span className="mb-cat-scan-val">{t("fit3d_bore_v")}</span>
                  </div>
                  <div className="mb-cat-scan-callout mb-cat-scan-callout--3">
                    <span className="mb-cat-scan-dot" />
                    <span className="mb-cat-scan-leader" />
                    <span className="mb-cat-scan-val">{t("cat_scan_offset")}</span>
                  </div>
                  <div className="mb-cat-scan-lock">
                    <span className="mb-cat-scan-lock-dot" />
                    <span className="mb-cat-scan-lock-t">{t("cat_scan_lock")}</span>
                  </div>
                </div>
                <div className="mb-cat-scan-line" />
              </div>

              <div className="mb-cat-grid">
                {parts.map((part, i) => (
                  <div key={i} className={`mb-ucat-card mb-glass ${part.fits ? "" : "is-unfit"}`}>
                    <div className="mb-cat-card-img-wrap">
                      <span className="mb-cat-genuine">{t("cat_badge_genuine")}</span>
                      <Image
                        src={part.img}
                        alt={t(part.key)}
                        fill
                        sizes="(max-width: 600px) 100vw, 300px"
                        className="mb-cat-card-img"
                      />
                    </div>
                    <div className="mb-cat-card-info">
                      <div className="mb-cat-card-brand">{t("cat_part_brand")}</div>
                      <div className="mb-cat-card-name">{t(part.key)}</div>
                      <div className="mb-cat-card-spec">{t(part.spec)}</div>
                    </div>
                    {!part.fits ? (
                      <div className="mb-cat-verified mb-cat-verified--unfit">
                        <span className="mb-cat-check">✕</span> {t("cat_chip_unfit")}
                      </div>
                    ) : (
                      garage &&
                      !isScanning && (
                        <div className="mb-cat-verified">
                          <span className="mb-cat-check">✓</span> {t("cat_part_verified")}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* R18 call C: authenticity as a property of "verified", not a
            second feature. One line, deliberately — anything that looks like
            a feature callout becomes the band call A removed. */}
        <p className="mb-cat-verified-note">{t("cat_verified_note")}</p>
      </div>
    </section>
  );
}

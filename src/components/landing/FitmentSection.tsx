"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useGlowCards } from "@/lib/hooks/useGlowCards";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useTilt } from "@/lib/hooks/useTilt";
import { useT } from "@/lib/i18n/LanguageProvider";

import HeroNetworkBackground from "./HeroNetworkBackground";

const AmbientAurora = dynamic(() => import("@/components/three/AmbientAurora"), {
  ssr: false,
});

/** Timeout before the docked cards show if the scene never fires fitment-first-loop. */
const CARDS_FALLBACK_MS = 9500;
/** Stagger between each docked card's entrance. */
const CARD_STAGGER_MS = 180;

/**
 * Fitment band — the 3D wheel scene on its own dark stage directly under the
 * hero (the cinematic opening act), with the part card, fit pill and video
 * card docked beneath it. Cards appear after the scene's first mount loop
 * (or a fallback timeout), instantly under reduced motion.
 */
export default function FitmentSection() {
  const t = useT();
  const reduced = useReducedMotion();
  const cardsGlowRef = useGlowCards<HTMLDivElement>();
  const tiltRef = useTilt<HTMLDivElement>();
  const [cardsShown, setCardsShown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [year, setYear] = useState("2024");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Avanza");
  const [trim, setTrim] = useState("1.5 G CVT");
  const [isScanning, setIsScanning] = useState(false);

  const handleYmmChange = (
    y: string,
    m: string,
    mod: string,
    tr: string,
  ) => {
    setYear(y);
    setMake(m);
    setModel(mod);
    setTrim(tr);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2300);
  };

  useEffect(() => {
    if (reduced) return; // CSS shows the cards instantly under reduced motion
    const show = () => setCardsShown(true);
    const timer = setTimeout(show, CARDS_FALLBACK_MS);
    document.addEventListener("fitment-first-loop", show, { once: true });
    return () => {
      clearTimeout(timer);
      document.removeEventListener("fitment-first-loop", show);
    };
  }, [reduced]);

  // Lazy muted looping playback (autoplay policies can ignore the attribute).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play()?.catch(() => {});
  }, []);

  const shown = cardsShown || reduced;
  const cardClass = (extra: string) =>
    `mb-herocard mb-glow-card mb-glow-card-fill ${extra}${shown ? " is-in" : ""}`;
  const cardDelay = (i: number) =>
    cardsShown && !reduced ? { transitionDelay: `${i * CARD_STAGGER_MS}ms` } : undefined;

  return (
    <section id="how-it-works" className="mb-fit3d mb-section">
      <AmbientAurora intensity={0.3} />
      <HeroNetworkBackground />
      <div className="mb-fit3d-inner mb-section-inner">
        <h2 data-rev="0" className="mb-h2 mb-h2--fit3d">
          {t("how_h2")}
        </h2>

        <div className="mb-ymm-container">
          <div className="mb-step-badge-row">
            <span className="mb-step-num">01</span>
            <label className="mb-ymm-label">{t("ymm_picker_label")}</label>
          </div>
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
        </div>

        {/* 3 Numbered Beats: 01 (Picker/Part) -> 02 (Scanner) -> 03 (Protection Strip) */}
        <div ref={cardsGlowRef} className="mb-fit3d-layout">
          <div className="mb-fit3d-col mb-fit3d-col--left">
            <div className={cardClass("mb-card-part")} style={cardDelay(0)}>
              <div className="mb-card-part-thumb" aria-hidden />
              <div className="mb-card-part-body">
                <div className="mb-card-part-name">{t("card_part_name")}</div>
                <div className="mb-card-part-sub">{t("card_part_sub")}</div>
                <div className="mb-card-part-row">
                  <span className="mb-card-part-price">{t("card_part_price")}</span>
                  <span className="mb-chip-tint">{t("card_part_chip")}</span>
                </div>
              </div>
            </div>
          </div>
          <div ref={tiltRef} data-rev="1" className={`mb-fit3d-stage${isScanning ? " is-scanning" : ""}`}>
            <div className="mb-step-num mb-step-num--stage">02</div>

            {/* 2D Car Image Frame */}
            <div className="mb-scan-car-frame" aria-hidden>
              <Image
                src="/veo/jakarta-hero-bg-poster.jpg"
                alt="Avanza Fitment Scanner"
                fill
                sizes="(max-width: 1040px) 100vw, 560px"
                className="mb-scan-car-img"
              />
              <div className="mb-scan-grid" />
            </div>

            {/* Laser Sweep Line */}
            <div className="mb-scan-overlay" aria-hidden>
              <div className="mb-scan-laser" />
            </div>

            {/* 4 Spec Callout Chips */}
            <div className="mb-scan-chips">
              <div className="mb-scan-chip">
                <span className="mb-chip-check">✓</span>
                <span>Bolt pattern 4×100</span>
              </div>
              <div className="mb-scan-chip">
                <span className="mb-chip-check">✓</span>
                <span>Rotor ⌀54.1mm</span>
              </div>
              <div className="mb-scan-chip">
                <span className="mb-chip-check">✓</span>
                <span>Ceramic pad · OEM</span>
              </div>
              <div className="mb-scan-chip">
                <span className="mb-chip-check">✓</span>
                <span>Authentic</span>
              </div>
            </div>

            {/* Telemetry Pill */}
            <div className="mb-fit3d-telemetry">
              <span className="mb-dot mb-pulse" aria-hidden />
              <span>{isScanning ? t("ymm_scanning") : `${t("ymm_verified")} ${year}`}</span>
            </div>
            <div className="mb-fit3d-stage-glow" aria-hidden />
          </div>
          <div className="mb-fit3d-col mb-fit3d-col--right">
            {/* Result card, not a beat — the stray "03" duplicated the protection
                strip's beat 03 (fix: second-section audit). */}
            <div className={cardClass("mb-card-fit")} style={cardDelay(1)}>
              <span className="mb-dot mb-dot--lg mb-pulse mb-pulse--fit" aria-hidden />
              <span className="mb-card-fit-label">{t("card_fit")}</span>
            </div>
            <div className={cardClass("mb-card-video")} style={cardDelay(2)}>
              <video
                ref={videoRef}
                src="/assets/unify-graph.mp4"
                muted
                loop
                playsInline
                autoPlay
                preload="none"
              />
              <div className="mb-card-video-cap">{t("card_video_cap")}</div>
            </div>
          </div>
        </div>

        {/* Beat 03 Compact Protection Strip */}
        <div className="mb-fit-protect" data-rev="2">
          <div className="mb-fit-protect-head">
            <span className="mb-step-num">03</span>
            <span className="mb-fit-protect-title">{t("how_s3_t")}</span>
          </div>
          <div className="mb-step-stack mb-step-stack--row">
            <div className="mb-prot-row">{t("prot_r1")}</div>
            <div className="mb-prot-row">{t("prot_r2")}</div>
            <div className="mb-prot-row is-hl">{t("prot_r3")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

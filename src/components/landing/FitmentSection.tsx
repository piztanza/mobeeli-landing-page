"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useGlowCards } from "@/lib/hooks/useGlowCards";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useTilt } from "@/lib/hooks/useTilt";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

import HeroNetworkBackground from "./HeroNetworkBackground";

// 3D scene is a client-only island (F-002) — moved out of the hero onto its
// own stage (founder direction 2026-07-23): the wheel gets a properly framed
// band and the product cards dock in a flex row beneath it, which removes the
// absolute-overlay collisions the full-viewport hero caused.
const FitmentWheel = dynamic(() => import("@/components/three/FitmentWheel"), {
  ssr: false,
  loading: () => null,
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
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const cardsGlowRef = useGlowCards<HTMLDivElement>();
  const tiltRef = useTilt<HTMLDivElement>();
  const [cardsShown, setCardsShown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <section id="fitment" className="mb-fit3d">
      <HeroNetworkBackground />
      <div className="mb-fit3d-inner">
        <div data-rev="0" className="mb-kicker mb-kicker--accent">
          {t("fit3d_kicker")}
        </div>
        {/* R7: wheel centered, spec boxes flanking it left/right in a grid —
            "boxes around it" without overlaying the 3D scene (no collisions). */}
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
          <div ref={tiltRef} data-rev="1" className="mb-fit3d-stage">
            <div className="mb-fit3d-telemetry">
              <span className="mb-dot mb-pulse" aria-hidden />
              <span>{t("fit3d_chip")}</span>
            </div>
            <div className="mb-fit3d-stage-glow" aria-hidden />
            <div className="mb-hero-scene">
              <FitmentWheel lang={lang} isStatic={reduced} onFirstLoop={() => setCardsShown(true)} />
            </div>
          </div>
          <div className="mb-fit3d-col mb-fit3d-col--right">
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
      </div>
    </section>
  );
}

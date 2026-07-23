"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useGlowCards } from "@/lib/hooks/useGlowCards";
import { useMagneticCTA } from "@/lib/hooks/useMagneticCTA";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

import HeroRotator from "./HeroRotator";

// 3D scene is a client-only island (F-002 ports the three.js scene into it).
const FitmentWheel = dynamic(() => import("@/components/three/FitmentWheel"), {
  ssr: false,
  loading: () => null,
});

/** Timeout before the floating cards show if the scene never fires fitment-first-loop. */
const HERO_CARDS_FALLBACK_MS = 9500;
/** Stagger between each floating card's entrance. */
const HERO_CARD_STAGGER_MS = 180;

/**
 * Dark hero (F-001): chip, rotating H1 (F-003), subline, CTAs, 3D scene
 * container and the three floating cards (part card, fit pill, video card).
 * Cards appear after the scene's first mount loop (or a fallback timeout),
 * instantly under reduced motion.
 */
export default function Hero() {
  const t = useT();
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const primaryCtaRef = useMagneticCTA<HTMLAnchorElement>();
  const secondaryCtaRef = useMagneticCTA<HTMLAnchorElement>();
  const heroGlowRef = useGlowCards<HTMLDivElement>();
  const [cardsShown, setCardsShown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduced) return; // CSS shows the cards instantly under reduced motion
    const show = () => setCardsShown(true);
    const timer = setTimeout(show, HERO_CARDS_FALLBACK_MS);
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
    cardsShown && !reduced ? { transitionDelay: `${i * HERO_CARD_STAGGER_MS}ms` } : undefined;

  return (
    <header id="top" className="mb-hero">
      <div className="mb-hero-bg-media" aria-hidden>
        {!reduced ? (
          <video
            src="/veo/jakarta-hero-bg.mp4"
            poster="/veo/jakarta-hero-bg-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <Image src="/veo/jakarta-hero-bg-poster.jpg" alt="" fill sizes="100vw" />
        )}
        <div className="mb-hero-bg-scrim" />
      </div>
      <div className="mb-hero-grid">
        <div>
          <div data-rev="0" className="mb-hero-chip">
            <span className="mb-dot mb-pulse" aria-hidden />
            <span>{t("hero_chip")}</span>
          </div>
          <HeroRotator />
          <p data-rev="2" className="mb-hero-sub">
            {t("hero_sub_short")}
          </p>
          <div data-rev="3" className="mb-hero-ctas">
            {/* Straight to platform registration (founder decision 2026-07-23). */}
            <a
              ref={primaryCtaRef}
              href="https://mobilee-demo.vercel.app/platform/join"
              target="_blank"
              rel="noreferrer"
              className="mb-btn-primary-dark mb-magnetic-cta"
            >
              {t("hero_cta_shops")}
            </a>
            <Link ref={secondaryCtaRef} href="/investors" className="mb-btn-ghost-dark mb-magnetic-cta">
              {t("hero_cta_inv")}
            </Link>
          </div>
        </div>
        <div ref={heroGlowRef} data-rev="2" className="mb-hero-visual">
          <div className="mb-hero-scene">
            <FitmentWheel lang={lang} isStatic={reduced} onFirstLoop={() => setCardsShown(true)} />
          </div>
          <div className={`${cardClass("mb-card-part")} mb-float-a`} style={cardDelay(0)}>
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
          <div className={`${cardClass("mb-card-fit")} mb-float-b`} style={cardDelay(1)}>
            <span className="mb-dot mb-dot--lg mb-pulse mb-pulse--fit" aria-hidden />
            <span className="mb-card-fit-label">{t("card_fit")}</span>
          </div>
          <div
            className={`${cardClass("mb-card-video")} mb-float-a mb-float-a--slow`}
            style={cardDelay(2)}
          >
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
    </header>
  );
}

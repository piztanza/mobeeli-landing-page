"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { useMagneticCTA } from "@/lib/hooks/useMagneticCTA";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useT } from "@/lib/i18n/LanguageProvider";

import HeroRotator from "./HeroRotator";

import { AURORA_INTENSITY } from "@/components/three/auroraIntensity";

const AmbientAurora = dynamic(() => import("@/components/three/AmbientAurora"), {
  ssr: false,
});

/**
 * Dark hero (F-001), type-focused since the R4 restructure: chip, rotating H1
 * (F-003), subline and CTAs centered over the graded Jakarta aerial. The 3D
 * fitment scene and its product cards live in the FitmentSection band
 * directly below (founder direction 2026-07-23).
 */
export default function Hero() {
  const t = useT();
  const reduced = useReducedMotion();
  const primaryCtaRef = useMagneticCTA<HTMLAnchorElement>();
  const secondaryCtaRef = useMagneticCTA<HTMLAnchorElement>();

  return (
    <header id="top" className="mb-hero">
      <div className="mb-hero-bg-media" aria-hidden>
        <AmbientAurora intensity={AURORA_INTENSITY} />
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
      </div>
    </header>
  );
}

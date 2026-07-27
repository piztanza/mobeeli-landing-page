"use client";

import { useRef } from "react";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

import ActiveSectionProvider from "./ActiveSectionProvider";
import BuyerStrip from "./BuyerStrip";
import FitmentSection from "./FitmentSection";
import Footer from "./Footer";
import Hero from "./Hero";
import Nav from "./Nav";
import ProblemSection from "./ProblemSection";
import SkipLink from "./SkipLink";
import UnifyBand from "./UnifyBand";

import "./landing.css";

/**
 * Landing page (F-001) — the band stack, alternating dark/light (R18):
 * nav (overlay) → hero (dark, full viewport) → catalog (dark, id="how-it-works")
 * → problem (light, id="problem") → coverage (dark, id="coverage") →
 * buyer strip (id="waitlist") → footer.
 *
 * R18 call A: ProtectionSection is no longer mounted here. Not because the
 * protection story is weak — counterfeits are estimated at 30%+ of parts sold —
 * but because "we make the aftermarket trustworthy" is the message Otoklix
 * ($10M Series A, 900+ workshops) and Bengkel Mania already occupy. The front
 * page stakes fitment, which nobody else is claiming. The mechanics move to
 * /platform and the deck. Component KEPT, same as AiCatalogCard under 1a.
 *
 * R16 ruling 1a: AiCatalogCard is no longer mounted here — it told a second,
 * competing "the catalog" story next to the working one in FitmentSection. The
 * component is deliberately KEPT in the repo (it is well built and may earn a
 * home on /why-mobeeli or in the deck); it simply is not on `/`.
 *
 * The data bands (proof bar, pain tiles, search comparison, why-now) live on
 * /why-mobeeli; Team and Investors keep their own routes (CHG-piztanza-09).
 * Scroll-reveal runs on [data-rev] elements and is disabled under
 * prefers-reduced-motion; the scrollspy silently tracks the active section.
 */
export default function LandingView() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);
  return (
    <LanguageProvider>
      <ActiveSectionProvider>
        <div ref={rootRef} className="mb-landing">
          <SkipLink />
          <Nav overlay />
          <main id="main-content" tabIndex={-1}>
            <Hero />
            <FitmentSection />
            <ProblemSection />
            <UnifyBand />
            <BuyerStrip />
          </main>
          <Footer />
        </div>
      </ActiveSectionProvider>
    </LanguageProvider>
  );
}

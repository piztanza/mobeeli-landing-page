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
 * Landing page (F-001) — the band stack (R18):
 * nav (overlay) → hero (dark, full viewport) → problem (light, id="problem")
 * → catalog (dark, id="how-it-works") → coverage (dark, id="coverage") →
 * buyer strip (id="waitlist") → footer.
 *
 * R18 call B: the problem leads. The Senen quote motivates the catalog band, so
 * it has to precede it — before this it sat behind the demo it sets up. It also
 * breaks up the two full dark screens a visitor used to get on arrival; the
 * remaining dark-on-dark seam moves down to catalog → coverage, between two
 * bands that are already visually distinct.
 *
 * Side effect worth recording: SPY_SECTION_IDS in ActiveSectionProvider is
 * ["problem", "how-it-works"] and resolveActive returns the FIRST match, so it
 * is a priority list. Until this reorder the DOM ran the other way round, which
 * meant that with both bands visible the spy marked the lower one. DOM order and
 * array order now agree.
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
            <ProblemSection />
            <FitmentSection />
            <UnifyBand />
            <BuyerStrip />
          </main>
          <Footer />
        </div>
      </ActiveSectionProvider>
    </LanguageProvider>
  );
}

"use client";

import { useRef } from "react";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

import ActiveSectionProvider from "./ActiveSectionProvider";
import AiCatalogCard from "./AiCatalogCard";
import BuyerStrip from "./BuyerStrip";
import FitmentSection from "./FitmentSection";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Nav from "./Nav";
import ProblemSection from "./ProblemSection";
import SkipLink from "./SkipLink";
import UnifyBand from "./UnifyBand";

import "./landing.css";

/**
 * Landing page (F-001, slimmed in the redesign) — the founder-approved
 * Variant-B band stack, alternating dark/light:
 * nav (overlay) → hero (dark, full viewport) → problem slim (light) →
 * unify band (dark, full section) → how it works (light) → AI catalog demo
 * (dark card, returned to the front page by founder decision 2026-07-23) →
 * buyer strip → footer. The data bands (proof bar, pain tiles, search
 * comparison, why-now) live on /why-mobeeli; Team and Investors keep their
 * own routes (CHG-piztanza-09, via SectionPage).
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
            <HowItWorks />
            <AiCatalogCard />
            <BuyerStrip />
          </main>
          <Footer />
        </div>
      </ActiveSectionProvider>
    </LanguageProvider>
  );
}

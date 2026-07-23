"use client";

import { useRef } from "react";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

import ActiveSectionProvider from "./ActiveSectionProvider";
import AiCatalogCard from "./AiCatalogCard";
import BuyerStrip from "./BuyerStrip";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Nav from "./Nav";
import ProblemSection from "./ProblemSection";
import ProofBar from "./ProofBar";
import SkipLink from "./SkipLink";
import UnifyBand from "./UnifyBand";
import WhyMobeeli from "./WhyMobeeli";

import "./landing.css";

/**
 * Landing page (F-001) — the approved band stack in the approved order:
 * nav → hero → proof bar → problem → how it works → buyer strip →
 * AI catalog → why Mobeeli → unify band → footer (AI catalog moved between
 * the buyer strip and Why Mobeeli, CHG-piztanza-14). Early Adaptors, Team and
 * Investors moved to their own routes /early-adaptors, /team and /investors
 * (CHG-piztanza-09, rendered via SectionPage). Scroll-reveal runs on
 * [data-rev] elements and is disabled under prefers-reduced-motion; the
 * scrollspy in ActiveSectionProvider silently tracks the active section.
 */
export default function LandingView() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);
  return (
    <LanguageProvider>
      <ActiveSectionProvider>
        <div ref={rootRef} className="mb-landing">
          <SkipLink />
          <Nav />
          <main id="main-content" tabIndex={-1}>
            <Hero />
            <ProofBar />
            <ProblemSection />
            <HowItWorks />
            <BuyerStrip />
            <AiCatalogCard />
            <WhyMobeeli />
            <UnifyBand />
          </main>
          <Footer />
        </div>
      </ActiveSectionProvider>
    </LanguageProvider>
  );
}

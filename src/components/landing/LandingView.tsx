"use client";

import { useRef } from "react";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

import AiCatalogCard from "./AiCatalogCard";
import BuyerStrip from "./BuyerStrip";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Nav from "./Nav";
import ProblemSection from "./ProblemSection";
import ProofBar from "./ProofBar";
import UnifyBand from "./UnifyBand";
import WhyMobeeli from "./WhyMobeeli";

import "./landing.css";

/**
 * Landing page (F-001) — the approved band stack in the approved order:
 * nav → hero → proof bar → problem → how it works → buyer strip →
 * why Mobeeli → AI catalog → unify band → footer. Early Adaptors, Team and
 * Investors moved to their own routes /early-adaptors, /team and /investors
 * (CHG-piztanza-09, rendered via SectionPage). Scroll-reveal runs on
 * [data-rev] elements and is disabled under prefers-reduced-motion.
 */
export default function LandingView() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);
  return (
    <LanguageProvider>
      <div ref={rootRef} className="mb-landing">
        <Nav />
        <main>
          <Hero />
          <ProofBar />
          <ProblemSection />
          <HowItWorks />
          <BuyerStrip />
          <WhyMobeeli />
          <AiCatalogCard />
          <UnifyBand />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

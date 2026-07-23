"use client";

import { useRef } from "react";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

import EarlyAdaptors from "./EarlyAdaptors";
import Footer from "./Footer";
import Investors from "./Investors";
import Nav from "./Nav";
import SkipLink from "./SkipLink";
import TeamSection from "./TeamSection";

import "./landing.css";

const SECTIONS = {
  team: TeamSection,
  "early-adaptors": EarlyAdaptors,
  investors: Investors,
} as const;

/** Section slugs that moved off the landing page onto their own routes. */
export type SectionPageId = keyof typeof SECTIONS;

/**
 * Standalone page for a section split off the landing stack
 * (CHG-piztanza-09): same sticky nav, EN/ID toggle and dark footer as the
 * landing page wrapped around the unchanged section component. Scroll-reveal
 * runs on [data-rev] elements and is disabled under prefers-reduced-motion.
 */
export default function SectionPage({ section }: { section: SectionPageId }) {
  const Section = SECTIONS[section];
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);
  return (
    <LanguageProvider>
      <div ref={rootRef} className="mb-landing">
        <SkipLink />
        <Nav />
        <main id="main-content" tabIndex={-1}>
          <Section />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

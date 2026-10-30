"use client";

import { useRef, type ReactNode } from "react";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

import CareersSection from "./CareersSection";
import ContactSection from "./ContactSection";
import EarlyAdopters from "./EarlyAdopters";
import Footer from "./Footer";
import Investors from "./Investors";
import Nav from "./Nav";
import PrivacySection from "./PrivacySection";
import SkipLink from "./SkipLink";
import TeamSection from "./TeamSection";

import "./landing.css";

/* FOUNDER 2026-07-30: /why-mobeeli (the data & facts page) is REMOVED —
   numbers and figures live in the pitch deck, never on the site. Its
   components (WhyMobeeli, ProblemStats, SearchComparison, ProofBar) stay in
   the repo unmounted, per the AiCatalogCard precedent. */
const SECTIONS = {
  team: TeamSection,
  "early-adopters": EarlyAdopters,
  investors: Investors,
  careers: CareersSection,
  contact: ContactSection,
  privacy: PrivacySection,
} as const;

/** Section slugs that moved off the landing page onto their own routes. */
export type SectionPageId = keyof typeof SECTIONS;

/**
 * Standalone page for a section split off the landing stack
 * (CHG-piztanza-09): same nav (in flow — it is not sticky), EN/ID toggle and dark footer as the
 * landing page wrapped around the unchanged section component. Scroll-reveal
 * runs on [data-rev] elements and is disabled under prefers-reduced-motion.
 *
 * A page that is not one of the mapped sections passes its content as children
 * instead (2026-10-31, /solutions). Everything in SECTIONS is imported here and
 * so ships with every section page; a children page brings its own bundle, so
 * the product page's explainer and stylesheet stay on /solutions.
 */
export default function SectionPage(
  props: { section: SectionPageId; children?: never } | { section?: never; children: ReactNode },
) {
  const Section = props.section ? SECTIONS[props.section] : null;
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);
  return (
    <LanguageProvider>
      <div ref={rootRef} className="mb-landing">
        <SkipLink />
        <Nav />
        <main id="main-content" tabIndex={-1}>
          {Section ? <Section /> : props.children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

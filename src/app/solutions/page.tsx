import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import Solutions from "@/components/solutions/Solutions";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /solutions: "Solutions | Mobeeli", the lede as description. */
export const metadata: Metadata = sectionMetadata("/solutions");

/**
 * Solutions (2026-10-31) — Mobeeli's SaaS page: the services, the interactive
 * fitment-flow explainer and pricing, in the shared section-page frame (nav,
 * EN/ID toggle, footer). Passed in as children rather than mapped in
 * SectionPage, so its bundle ships on this route alone.
 */
export default function SolutionsPage() {
  return (
    <SectionPage>
      <Solutions />
    </SectionPage>
  );
}

import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /early-adopters (renamed from /early-adaptors, founder decision 2026-07-23). */
export const metadata: Metadata = sectionMetadata("/early-adopters");

/**
 * Early Adopters page (F-001, CHG-piztanza-09) — the 3 benefit cards and the
 * waitlist CTA (F-009: routes to /join) on their own route.
 */
export default function EarlyAdoptersPage() {
  return <SectionPage section="early-adopters" />;
}

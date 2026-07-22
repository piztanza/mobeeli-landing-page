import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /early-adaptors (CHG-piztanza-09): pipe title + canonical. */
export const metadata: Metadata = sectionMetadata("/early-adaptors");

/**
 * Early Adaptors page (F-001, CHG-piztanza-09) — the 3 benefit cards and the
 * waitlist CTA (F-009: routes to /join) on their own route.
 */
export default function EarlyAdaptorsPage() {
  return <SectionPage section="early-adaptors" />;
}

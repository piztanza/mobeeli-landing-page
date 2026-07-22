import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /investors (CHG-piztanza-09): pipe title + canonical. */
export const metadata: Metadata = sectionMetadata("/investors");

/**
 * Investors page (F-001, CHG-piztanza-09) — the deck-request card with the
 * approved mailtos (F-009) on its own route.
 */
export default function InvestorsPage() {
  return <SectionPage section="investors" />;
}

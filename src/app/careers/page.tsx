import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /careers (founder request 2026-07-28). */
export const metadata: Metadata = sectionMetadata("/careers");

/** Careers page — honest pre-launch stance on its own route, linked from the footer. */
export default function CareersPage() {
  return <SectionPage section="careers" />;
}

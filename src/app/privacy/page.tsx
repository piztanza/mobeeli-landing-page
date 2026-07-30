import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /privacy (founder request 2026-07-30). */
export const metadata: Metadata = sectionMetadata("/privacy");

/** Privacy notice — linked from the contact form's hint line and the footer. */
export default function PrivacyPage() {
  return <SectionPage section="privacy" />;
}

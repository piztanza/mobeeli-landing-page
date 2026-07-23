import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /why-mobeeli: pipe title + canonical. */
export const metadata: Metadata = sectionMetadata("/why-mobeeli");

/** Why Mobeeli — the data & facts page: why-now narrative + the stats moved off the slim landing. */
export default function WhyMobeeliPage() {
  return <SectionPage section="why-mobeeli" />;
}

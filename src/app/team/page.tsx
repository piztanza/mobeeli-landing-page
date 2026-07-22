import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /team (CHG-piztanza-09): pipe title + canonical. */
export const metadata: Metadata = sectionMetadata("/team");

/** Team page (F-001, CHG-piztanza-09) — the 3 founder cards on their own route. */
export default function TeamPage() {
  return <SectionPage section="team" />;
}

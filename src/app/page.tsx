import type { Metadata } from "next";

import LandingView from "@/components/landing/LandingView";
import { landingMetadata } from "@/lib/seo";

/** SEO + social meta for / (F-010): title/description/OG/Twitter + canonical. */
export const metadata: Metadata = landingMetadata();

/**
 * Landing page — approved section stack (F-001) with the hero headline
 * rotation (F-003) and waitlist CTA wiring (F-009). Early Adaptors, Team and
 * Investors live on their own routes (CHG-piztanza-09). The 3D scenes
 * (F-002, F-006) and the AI-catalog animation loop (F-005) ship separately.
 */
export default function LandingPage() {
  return <LandingView />;
}

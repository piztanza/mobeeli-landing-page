import type { Metadata } from "next";

import JoinView from "@/components/join/JoinView";
import { joinMetadata } from "@/lib/seo";

/** SEO + social meta for /join (F-010): title/description/OG/Twitter + canonical. */
export const metadata: Metadata = joinMetadata();

/** Join Waitlist page (F-007) — split-screen brand panel + 4-step wizard (S-002/S-003). */
export default function JoinPage() {
  return <JoinView />;
}

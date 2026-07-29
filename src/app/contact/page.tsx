import type { Metadata } from "next";

import SectionPage from "@/components/landing/SectionPage";
import { sectionMetadata } from "@/lib/seo";

/** SEO + social meta for /contact (founder request 2026-07-29). */
export const metadata: Metadata = sectionMetadata("/contact");

/** Contact page — the founder inboxes' home; other surfaces link here. */
export default function ContactPage() {
  return <SectionPage section="contact" />;
}

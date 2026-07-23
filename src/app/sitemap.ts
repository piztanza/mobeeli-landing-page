import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/** sitemap.xml (F-010): every indexable route — /, /join and the section
 *  pages split off the landing stack (CHG-piztanza-09). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/join`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/early-adaptors`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/why-mobeeli`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/team`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/investors`, changeFrequency: "weekly", priority: 0.6 },
  ];
}

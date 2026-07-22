import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/** sitemap.xml (F-010): the two indexable routes, / and /join. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/join`, changeFrequency: "weekly", priority: 0.8 },
  ];
}

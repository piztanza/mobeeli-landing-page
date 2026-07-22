import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/** robots.txt (F-010): allow crawling of the marketing pages, point at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

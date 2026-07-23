import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LANG } from "@/lib/i18n";
import {
  organizationJsonLd,
  rootMetadata,
  serializeJsonLd,
  themeViewport,
  webSiteJsonLd,
} from "@/lib/seo";

import "./globals.css";

/** Site-wide metadata defaults (F-010): metadataBase + title/description. */
export const metadata: Metadata = rootMetadata();

/** theme-color #0d1522 per the change record. */
export const viewport: Viewport = themeViewport;

/** Type system (R6): unified on GeistSans — Vercel's typeface, bundled and
 *  self-hosted by the `geist` package via next/font (no runtime CDN,
 *  CLAUDE.md compliant). One premium grotesque across text and display reads
 *  cleaner than the earlier Inter/Plus-Jakarta split. `--font-geist-sans` is
 *  its CSS variable; globals.css routes body + headings through it. Plus
 *  Jakarta Sans stays available as a fallback token if a display accent is
 *  wanted back. */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANG} className={GeistSans.variable}>
      <body>
        {children}
        {/* Organization + WebSite JSON-LD (CHG-piztanza-07), server-rendered so
            Google shows the brand name above the URL. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(webSiteJsonLd()) }}
        />
      </body>
    </html>
  );
}

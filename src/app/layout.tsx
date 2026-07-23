import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

/** Text/UI face (R4 font system): Inter variable, self-hosted at build time by
 *  next/font (no runtime CDN — CLAUDE.md compliant). Display type stays
 *  Plus Jakarta Sans (the brand face, commissioned for Jakarta's city
 *  program); the pairing follows the display+text convention of the top
 *  product sites (Figma, GitHub, Mercury run Inter for UI text). */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANG} className={inter.variable}>
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

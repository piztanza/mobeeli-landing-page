import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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

/** Type system (R7): matches the platform (mobilee-demo /platform) so the
 *  marketing site and the product read as one brand — Space Grotesk for
 *  display/headings (the platform's techy display face), Inter for body/UI.
 *  Both self-hosted at build by next/font (no runtime CDN, CLAUDE.md
 *  compliant); globals.css routes --mb-font-display / --mb-font-text through
 *  their variables. */
const fontInter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fontSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANG} className={`${fontInter.variable} ${fontSpaceGrotesk.variable}`}>
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

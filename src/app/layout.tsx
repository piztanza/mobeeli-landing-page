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

/** Type system (R16, founder ruling 7a): ONE family. Plus Jakarta Sans is
 *  self-hosted in globals.css as a variable font (200-800) and both
 *  --mb-font-text and --mb-font-display point at it, so this layout no longer
 *  loads any webfont at all (superseding the R7 pairing — three families down
 *  to one, and one less build step). */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANG}>
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

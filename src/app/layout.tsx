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
      <head>
        {/* Preload the upright face (e2e audit 2026-07-31). It is referenced
            only from globals.css, so the browser could not discover it until
            the stylesheet had parsed; with font-display: swap that meant the
            fallback painted first and every line reflowed when the real font
            landed. Measured layout shift on /contact — the most text-dense
            page above the fold — was CLS 0.199 at 768px, well past the 0.1
            "good" threshold, while lighter pages sat near zero.
            crossOrigin is REQUIRED even same-origin: fonts fetch in anonymous
            CORS mode, and without it the browser fetches the file twice.
            Italic is deliberately NOT preloaded — it is barely used, and
            preloading an unused face just delays the one that matters. */}
        <link
          rel="preload"
          href="/fonts/pjs-normal-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
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

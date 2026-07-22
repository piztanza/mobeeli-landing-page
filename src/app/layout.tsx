import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LANG } from "@/lib/i18n";
import { rootMetadata, themeViewport } from "@/lib/seo";

import "./globals.css";

/** Site-wide metadata defaults (F-010): metadataBase + title/description. */
export const metadata: Metadata = rootMetadata();

/** theme-color #0d1522 per the change record. */
export const viewport: Viewport = themeViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANG}>
      <body>{children}</body>
    </html>
  );
}

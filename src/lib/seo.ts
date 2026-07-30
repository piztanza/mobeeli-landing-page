import type { Metadata, Viewport } from "next";

import { DEFAULT_LANG, t, type CopyKey } from "@/lib/i18n";

/**
 * SEO + social meta (F-010). Canonical URLs, metadataBase, robots and the
 * sitemap all derive from NEXT_PUBLIC_SITE_URL (documented in .env.example);
 * production default is https://mobeeli.com. Metadata is rendered server-side
 * in the default language (the EN/ID toggle is a client concern per F-004).
 */

/** Canonical production origin — override with NEXT_PUBLIC_SITE_URL. */
export const DEFAULT_SITE_URL = "https://mobeeli.com";

/** Brand name for og:site_name (proper noun, identical in both languages). */
export const SITE_NAME = "Mobeeli";

/** Brand dark surface (#0d1522) — OG image background and browser theme-color. */
export const THEME_COLOR = "#0d1522";

/** OG/Twitter card canvas per the change record: 1200×630. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = "image/png";

/** Favicon sizes per Google guidelines (CHG-piztanza-07): 48×48 + 192×192. */
export const FAVICON_SIZES = [
  { width: 48, height: 48 },
  { width: 192, height: 192 },
] as const;

/** Social/profile URLs for Organization sameAs — extend as profiles launch. */
export const ORGANIZATION_SAME_AS: readonly string[] = [];

/** Site origin from NEXT_PUBLIC_SITE_URL (trailing slashes stripped), default https://mobeeli.com. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

/** Tagline rendered on the OG image — the approved hero headline pair. */
export function ogTagline(): string {
  return `${t(DEFAULT_LANG, "hero.line1")} ${t(DEFAULT_LANG, "hero.line2")}`;
}

/** Alt text for the OG/Twitter image. */
export function ogImageAlt(): string {
  return t(DEFAULT_LANG, "meta.title");
}

/** Browser chrome viewport meta — theme-color matches the dark brand surface. */
export const themeViewport: Viewport = { themeColor: THEME_COLOR };

/** Root (layout) metadata: metadataBase + site-wide title/description defaults. */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl()),
    title: t(DEFAULT_LANG, "meta.title"),
    description: t(DEFAULT_LANG, "meta.description"),
  };
}

/**
 * Section pages split off the landing stack (CHG-piztanza-09). Titles follow
 * the "<Page> | Mobeeli" pipe pattern using the approved nav labels; the
 * descriptions reuse approved section copy — no new strings outside the i18n
 * maps.
 */
const SECTION_PAGE_COPY = {
  "/team": { titleKey: "nav_team", descriptionKey: "team_h2" },
  "/early-adopters": { titleKey: "nav_early", descriptionKey: "early_h2" },
  "/investors": { titleKey: "nav_inv", descriptionKey: "inv_p" },
  "/careers": { titleKey: "nav_careers", descriptionKey: "careers_h2" },
  "/contact": { titleKey: "nav_contact", descriptionKey: "contact_p" },
} as const satisfies Record<string, { titleKey: CopyKey; descriptionKey: CopyKey }>;

/** Routes for the sections moved off the landing page (CHG-piztanza-09). */
export type SectionPagePath = keyof typeof SECTION_PAGE_COPY;

type PagePath = "/" | "/join" | SectionPagePath;

function pageTitle(pagePath: PagePath): string {
  if (pagePath === "/") return t(DEFAULT_LANG, "meta.title");
  if (pagePath === "/join") return t(DEFAULT_LANG, "meta.join.title");
  return `${t(DEFAULT_LANG, SECTION_PAGE_COPY[pagePath].titleKey)} | ${SITE_NAME}`;
}

function pageDescription(pagePath: PagePath): string {
  if (pagePath === "/") return t(DEFAULT_LANG, "meta.description");
  if (pagePath === "/join") return t(DEFAULT_LANG, "meta.join.description");
  return t(DEFAULT_LANG, SECTION_PAGE_COPY[pagePath].descriptionKey);
}

/** Per-route metadata. Next.js does not deep-merge openGraph
 *  across layout/page, so each page carries its complete OG/Twitter block.
 *
 *  The images are EXPLICIT, not left to the file-convention routes. An earlier
 *  version of this comment assumed src/app/opengraph-image.tsx would "append
 *  og:image automatically" to every page — measured on the deployed site, it
 *  attaches only to the root route, so /team, /investors, /why-mobeeli and
 *  /join declared twitter:card=summary_large_image while emitting NO image at
 *  all: link previews of the investor-facing pages rendered without a card.
 *  Every page now points at the root-generated image directly. */
function pageMetadata(pagePath: PagePath): Metadata {
  const title = pageTitle(pagePath);
  const description = pageDescription(pagePath);
  const ogImage = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME };
  return {
    title,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      alternateLocale: "id_ID",
      url: pagePath,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export function landingMetadata(): Metadata {
  return pageMetadata("/");
}

export function joinMetadata(): Metadata {
  return pageMetadata("/join");
}

/** Metadata for /team, /early-adopters and /investors (CHG-piztanza-09). */
export function sectionMetadata(pagePath: SectionPagePath): Metadata {
  return pageMetadata(pagePath);
}

/**
 * Structured data (CHG-piztanza-07): Organization + WebSite JSON-LD emitted by
 * the root layout so Google shows the "Mobeeli" brand name above the URL.
 */

/** schema.org Organization: name, url, absolute logo URL, description (+ sameAs when populated). */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl(),
    logo: `${siteUrl()}/assets/mobeeli-mark.png`,
    description: t(DEFAULT_LANG, "meta.description"),
    ...(ORGANIZATION_SAME_AS.length > 0 ? { sameAs: [...ORGANIZATION_SAME_AS] } : {}),
  };
}

/** schema.org WebSite: site name + url. */
export function webSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
  };
}

/** Serialize JSON-LD for a <script> tag, escaping "<" against script injection. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

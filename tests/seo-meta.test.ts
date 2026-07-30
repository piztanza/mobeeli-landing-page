import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { size as appleIconSize } from "@/app/apple-icon";
import { generateImageMetadata as faviconMetadata } from "@/app/icon";
import { metadata as joinPageMetadata } from "@/app/join/page";
import RootLayout, { metadata as layoutMetadata, viewport } from "@/app/layout";
import { metadata as landingPageMetadata } from "@/app/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { copy, langs, t } from "@/lib/i18n";
import {
  DEFAULT_SITE_URL,
  FAVICON_SIZES,
  OG_IMAGE_SIZE,
  THEME_COLOR,
  ogImageAlt,
  ogTagline,
  organizationJsonLd,
  serializeJsonLd,
  siteUrl,
  webSiteJsonLd,
} from "@/lib/seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("site URL resolution (F-010)", () => {
  it("defaults to https://mobeeli.com when NEXT_PUBLIC_SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl()).toBe(DEFAULT_SITE_URL);
    expect(DEFAULT_SITE_URL).toBe("https://mobeeli.com");
  });

  it("derives from NEXT_PUBLIC_SITE_URL, stripping trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.mobeeli.com/");
    expect(siteUrl()).toBe("https://staging.mobeeli.com");
  });
});

describe("route metadata (F-010)", () => {
  it("titles use the pipe separator per CHG-piztanza-07 in both languages", () => {
    expect(t("en", "meta.title")).toBe("Mobeeli | Every part, verified to fit.");
    expect(t("id", "meta.title")).toBe("Mobeeli | Setiap suku cadang, dipastikan cocok.");
    for (const lang of langs) {
      expect(t(lang, "meta.join.title")).toBe("Join Waitlist | Mobeeli");
    }
  });

  it("layout sets metadataBase, default title/description and theme-color #0d1522", () => {
    expect(String(layoutMetadata.metadataBase)).toBe(`${DEFAULT_SITE_URL}/`);
    expect(layoutMetadata.title).toBe(t("en", "meta.title"));
    expect(layoutMetadata.description).toBe(t("en", "meta.description"));
    expect(THEME_COLOR).toBe("#0d1522");
    expect(viewport.themeColor).toBe(THEME_COLOR);
  });

  it("landing page exposes title/description/OG/Twitter and canonical /", () => {
    expect(landingPageMetadata.title).toBe(t("en", "meta.title"));
    expect(landingPageMetadata.description).toBe(t("en", "meta.description"));
    expect(landingPageMetadata.alternates?.canonical).toBe("/");
    expect(landingPageMetadata.openGraph?.title).toBe(t("en", "meta.title"));
    expect(landingPageMetadata.openGraph?.url).toBe("/");
    expect(landingPageMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: t("en", "meta.title"),
    });
  });

  it("join page exposes title/description/OG/Twitter and canonical /join", () => {
    expect(joinPageMetadata.title).toBe(t("en", "meta.join.title"));
    expect(joinPageMetadata.description).toBe(t("en", "meta.join.description"));
    expect(joinPageMetadata.alternates?.canonical).toBe("/join");
    expect(joinPageMetadata.openGraph?.title).toBe(t("en", "meta.join.title"));
    expect(joinPageMetadata.openGraph?.description).toBe(t("en", "meta.join.description"));
    expect(joinPageMetadata.openGraph?.url).toBe("/join");
    expect(joinPageMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: t("en", "meta.join.title"),
    });
  });

  it("meta copy exists in both languages and follows the copy rules (no fee figures, no incumbent names)", () => {
    const metaKeys = ["meta.title", "meta.description", "meta.join.title", "meta.join.description"] as const;
    for (const lang of langs) {
      for (const key of metaKeys) {
        const value = copy[lang][key];
        expect(value.trim(), `${lang}.${key}`).not.toBe("");
        expect(value, `${lang}.${key} must not contain fee figures`).not.toMatch(/\d+(?:[.,]\d+)?\s*%/);
        expect(value, `${lang}.${key} must not name incumbents`).not.toMatch(
          /tokopedia|shopee|lazada|bukalapak|monotaro|blibli/i,
        );
      }
    }
  });
});

describe("OG image spec (F-010)", () => {
  it("is 1200x630 with the approved tagline and non-empty alt", () => {
    expect(OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    expect(ogTagline()).toBe(`${t("en", "hero.line1")} ${t("en", "hero.line2")}`);
    expect(ogImageAlt()).toBe(t("en", "meta.title"));
  });
});

describe("structured data JSON-LD (CHG-piztanza-07)", () => {
  it("Organization JSON-LD carries name, url, absolute logo URL and description", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(organizationJsonLd()).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Mobeeli",
      url: DEFAULT_SITE_URL,
      logo: `${DEFAULT_SITE_URL}/assets/mobeeli-mark.png`,
      description: t("en", "meta.description"),
    });
  });

  it("WebSite JSON-LD carries the site name and url", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(webSiteJsonLd()).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Mobeeli",
      url: DEFAULT_SITE_URL,
    });
  });

  it("root layout server-renders both ld+json scripts and each parses as valid JSON", () => {
    const html = renderToStaticMarkup(createElement(RootLayout, null, null));
    const scripts = [
      ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
    ].map((match) => match[1]);
    expect(scripts).toHaveLength(2);
    const types = scripts.map((raw) => (JSON.parse(raw) as { "@type": string })["@type"]);
    expect(types).toEqual(["Organization", "WebSite"]);
  });

  it("serializeJsonLd escapes < so payloads cannot close the script tag, and round-trips", () => {
    expect(serializeJsonLd({ x: "</script>" })).not.toContain("</script>");
    expect(JSON.parse(serializeJsonLd(organizationJsonLd()))).toEqual(organizationJsonLd());
    expect(JSON.parse(serializeJsonLd(webSiteJsonLd()))).toEqual(webSiteJsonLd());
  });
});

describe("favicon sizes (CHG-piztanza-07)", () => {
  it("serves 48x48 and 192x192 favicons per Google guidelines; apple icon unchanged at 180", () => {
    expect(FAVICON_SIZES).toEqual([
      { width: 48, height: 48 },
      { width: 192, height: 192 },
    ]);
    expect(faviconMetadata().map((entry) => entry.size)).toEqual([...FAVICON_SIZES]);
    expect(appleIconSize).toEqual({ width: 180, height: 180 });
  });
});

describe("robots.txt and sitemap.xml (F-010)", () => {
  it("robots allows crawling and points at the sitemap on the site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.mobeeli.com");
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0]?.allow).toBe("/");
    expect(result.sitemap).toBe("https://staging.mobeeli.com/sitemap.xml");
  });

  it("sitemap lists every indexable route on the default site URL (CHG-piztanza-09)", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      "https://mobeeli.com/",
      "https://mobeeli.com/join",
      "https://mobeeli.com/early-adopters",
      "https://mobeeli.com/team",
      "https://mobeeli.com/investors",
      "https://mobeeli.com/careers",
      "https://mobeeli.com/contact",
      "https://mobeeli.com/privacy",
    ]);
  });
});

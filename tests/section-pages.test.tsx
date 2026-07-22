import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import EarlyAdaptorsPage, { metadata as earlyAdaptorsMetadata } from "@/app/early-adaptors/page";
import InvestorsPage, { metadata as investorsMetadata } from "@/app/investors/page";
import TeamPage, { metadata as teamMetadata } from "@/app/team/page";
import sitemap from "@/app/sitemap";
import { FOUNDER_EMAILS } from "@/components/landing/Investors";
import { t, type CopyKey } from "@/lib/i18n";

/** Escape a copy string the way React escapes text content in SSR output. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** The three section pages split off the landing stack (CHG-piztanza-09). */
const PAGES: readonly {
  path: "/team" | "/early-adaptors" | "/investors";
  Page: () => ReactElement;
  metadata: typeof teamMetadata;
  titleKey: CopyKey;
  descriptionKey: CopyKey;
  sectionId: string;
  h2Key: CopyKey;
}[] = [
  {
    path: "/team",
    Page: TeamPage,
    metadata: teamMetadata,
    titleKey: "nav_team",
    descriptionKey: "team_h2",
    sectionId: "team",
    h2Key: "team_h2",
  },
  {
    path: "/early-adaptors",
    Page: EarlyAdaptorsPage,
    metadata: earlyAdaptorsMetadata,
    titleKey: "nav_early",
    descriptionKey: "early_h2",
    sectionId: "early-adaptor",
    h2Key: "early_h2",
  },
  {
    path: "/investors",
    Page: InvestorsPage,
    metadata: investorsMetadata,
    titleKey: "nav_inv",
    descriptionKey: "inv_p",
    sectionId: "investors",
    h2Key: "inv_h2",
  },
];

describe.each(PAGES)(
  "section page $path (CHG-piztanza-09)",
  ({ path, Page, metadata, titleKey, descriptionKey, sectionId, h2Key }) => {
    const html = renderToStaticMarkup(<Page />);

    it("renders the section content between the sticky nav and the footer", () => {
      const nav = html.indexOf('class="mb-nav"');
      const section = html.indexOf(`id="${sectionId}"`);
      const footer = html.indexOf('class="mb-footer"');
      expect(nav).toBeGreaterThanOrEqual(0);
      expect(section).toBeGreaterThan(nav);
      expect(footer).toBeGreaterThan(section);
      expect(html).toContain(esc(t("en", h2Key)));
    });

    it("renders the EN/ID pill toggle", () => {
      expect(html).toContain(">EN</button>");
      expect(html).toContain(">ID</button>");
      expect(html).toContain('aria-pressed="true"');
    });

    it("nav points at the section routes and resolves landing anchors via /#id", () => {
      for (const href of [
        "/#problem",
        "/#how-it-works",
        "/#why-now",
        "/early-adaptors",
        "/team",
        "/investors",
        "/join",
      ]) {
        expect(html).toContain(`href="${href}"`);
      }
    });

    it("exposes its own pipe title, description, canonical and OG/Twitter meta", () => {
      const title = `${t("en", titleKey)} | Mobeeli`;
      expect(metadata.title).toBe(title);
      expect(metadata.description).toBe(t("en", descriptionKey));
      expect(metadata.alternates?.canonical).toBe(path);
      expect(metadata.openGraph?.title).toBe(title);
      expect(metadata.openGraph?.url).toBe(path);
      expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title });
    });

    it("is listed in the sitemap", () => {
      const urls = sitemap().map((entry) => entry.url);
      expect(urls.some((url) => url.endsWith(path))).toBe(true);
    });
  },
);

describe("section page specifics (CHG-piztanza-09)", () => {
  it("/early-adaptors routes its waitlist CTA to /join (F-009)", () => {
    const html = renderToStaticMarkup(<EarlyAdaptorsPage />);
    // nav CTA + section CTA both target /join
    expect(html.match(/href="\/join"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain(esc(t("en", "early_cta")));
  });

  it("/team renders the 3 founder cards", () => {
    const html = renderToStaticMarkup(<TeamPage />);
    for (const key of ["team_n1", "team_n2", "team_n3"] as const) {
      expect(html).toContain(esc(t("en", key)));
    }
  });

  it("/investors offers the deck-request CTA (F-016) and keeps the founder emails (F-009)", () => {
    const html = renderToStaticMarkup(<InvestorsPage />);
    // "Request the deck" now opens the bilingual form (F-016) instead of the old mailto
    // (the plain footer contact mailto without the deck-request subject stays).
    expect(html).toContain(`>${esc(t("en", "inv_cta"))}</button>`);
    expect(html).not.toContain("deck%20request");
    for (const email of FOUNDER_EMAILS) {
      expect(html).toContain(`mailto:${email}`);
    }
  });
});

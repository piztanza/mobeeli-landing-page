import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LandingPage from "@/app/page";
import ProtectionSection from "@/components/landing/ProtectionSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

/**
 * R16 ruling 1c — protection as its own band.
 *
 * Context worth keeping: `prot_r1/2/3` and `how_s3_t` were defined in copy.ts
 * but rendered by NOTHING after R15 replaced the fitment section (the compact
 * strip they lived in went with it). The protection story was silently missing
 * from the page. This band restores it, so the regression this guards against
 * is "the promises exist in copy but nobody shows them".
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
const band = renderToStaticMarkup(
  <LanguageProvider>
    <ProtectionSection />
  </LanguageProvider>,
);
const page = renderToStaticMarkup(<LandingPage />);

describe("protection band renders the promises", () => {
  it("is a light band with its own anchor id", () => {
    expect(band).toContain('id="protection"');
    expect(page).toContain('id="protection"');
    expect(landingCss).toMatch(/\.mb-protect \{[^}]*background: var\(--mb-surface\);/s);
  });

  it("shows all three protection promises, in both languages", () => {
    for (const k of ["prot_r1", "prot_r2", "prot_r3"] as const) {
      expect(band, k).toContain(t("en", k));
      for (const lang of langs) expect(t(lang, k), `${lang}.${k}`).toBeTruthy();
    }
  });

  it("leads with the H2 at the shared scale — no size override, no revived eyebrow", () => {
    expect(band).toContain(t("en", "how_s3_t"));
    expect(band).toContain("mb-h2");
    // R8 retired the per-band kicker; this band must not reintroduce one.
    expect(band).not.toContain("mb-kicker");
    expect(landingCss).not.toMatch(/\.mb-h2--protect \{[^}]*font-size:/s);
  });

  it("carries an icon per promise, decorative and correctly sized", () => {
    const icons = band.match(/<svg[^>]*mb-protect-icon[^>]*>/g) ?? [];
    expect(icons).toHaveLength(3);
    for (const svg of icons) {
      expect(svg).toContain('width="24"');
      expect(svg).toContain('stroke-width="1.5"');
      expect(svg).toContain("aria-hidden");
    }
  });
});

describe("the old nested strip is gone", () => {
  it("removed the dead .mb-fit-protect rules with the markup they styled", () => {
    const rules = landingCss.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const dead of [".mb-fit-protect", ".mb-step-stack--row"]) {
      expect(rules, `${dead} should be gone`).not.toContain(dead);
    }
  });
});

describe("nav (founder ruling: drop Why Mobeeli, not Investors)", () => {
  it("anchors protection and keeps Investors", () => {
    expect(page).toContain('href="/#protection"');
    expect(page).toContain('href="/investors"');
  });

  it("no longer links /why-mobeeli from the bar, but the route still exists", () => {
    expect(page).not.toContain('href="/why-mobeeli"');
    for (const lang of langs) expect(t(lang, "nav_protect"), `${lang}.nav_protect`).toBeTruthy();
  });

  it("keeps the bar at six links so it still fits the 1040px breakpoint", () => {
    const bar = page.slice(0, page.indexOf('id="mb-nav-sheet"'));
    const links = bar.match(/class="mb-nav-links"[\s\S]*?<\/div>/)?.[0] ?? "";
    expect((links.match(/<a /g) ?? []).length).toBe(6);
  });
});

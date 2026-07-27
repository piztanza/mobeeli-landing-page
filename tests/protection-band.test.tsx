import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LandingPage from "@/app/page";
import ProtectionSection from "@/components/landing/ProtectionSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

/**
 * The protection band — component contract.
 *
 * The arc, honestly: `prot_r1/2/3` and `how_s3_t` were defined in copy.ts but
 * rendered by NOTHING after R15 replaced the fitment section (the compact strip
 * they lived in went with it). R16 ruling 1c built this band and fixed that real
 * hole. R18 call A then unmounted it from `/` — for POSITIONING, not because it
 * was wrong: "we make the aftermarket trustworthy" is the message Otoklix and
 * Bengkel Mania already occupy, so the front page stakes fitment instead.
 *
 * The component still exists and must still work wherever it is next mounted
 * (/platform is the likely home), so the component-level assertions below stay.
 * The live-page assertions are gone — `tests/landing.test.tsx` now guards the
 * opposite: that the band does NOT appear on `/`.
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

describe("nav, after R18 call A freed the protection slot", () => {
  it("keeps Investors in the bar", () => {
    expect(page).toContain('href="/investors"');
  });

  // The band is unmounted but its copy stays paired, so restoring it anywhere is
  // a mount rather than a translation round. The link-count guard lives in
  // tests/landing.test.tsx; duplicating it here would just be two places to fix.
  it("keeps the protection copy defined and paired in both languages", () => {
    for (const lang of langs) {
      expect(t(lang, "nav_protect"), `${lang}.nav_protect`).toBeTruthy();
      expect(t(lang, "how_s3_t"), `${lang}.how_s3_t`).toBeTruthy();
    }
  });
});

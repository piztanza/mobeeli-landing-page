import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Footer from "@/components/landing/Footer";
import HeroRotator from "@/components/landing/HeroRotator";
import AiCatalogCard from "@/components/landing/AiCatalogCard";
import ProblemSection from "@/components/landing/ProblemSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

/**
 * R8 — Claude-design (hallmark) audit polish. Pins the non-obvious fixes from
 * the audited punch list so a later edit can't silently regress them. CSS is
 * asserted as string contracts (the established pattern in this suite).
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
const globalsCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function render(node: React.ReactElement): string {
  return renderToStaticMarkup(<LanguageProvider>{node}</LanguageProvider>);
}

describe("R8 · color & contrast", () => {
  it("routes the two failing helper texts to AA-passing neutrals (audit #2)", () => {
    expect(landingCss).toMatch(/\.mb-early-note \{[^}]*color: var\(--mb-muted\);/s);
    expect(landingCss).toMatch(/\.mb-footer-copy \{[^}]*color: var\(--mb-dark-muted\);/s);
  });

  it("tokenizes the off-token danger red on the dark cards (audit #15)", () => {
    expect(globalsCss).toContain("--mb-danger-on-dark: #f87171;");
    // No raw #f87171 remains in the landing stylesheet.
    expect(landingCss).not.toContain("#f87171");
    expect(landingCss).toContain("color: var(--mb-danger-on-dark);");
  });
});

describe("R8 · typography", () => {
  // SUPERSEDED BY R16 (ruling 7a). The R8 fix pinned these heads to 600 because
  // the display face was Space Grotesk, whose axis stops at 700 — an 800 request
  // faux-bolded. R16 moves the whole page onto Plus Jakarta Sans (variable
  // 200-800), where 800 is a real instance, so the heads unify at 800 instead.
  // The invariant that still matters is that they MATCH each other.
  it("keeps the H2 heads unified at one real weight (audit #3, retuned in R16)", () => {
    expect(landingCss).toMatch(/\.mb-cat-h2 \{[^}]*font-weight: 800;/s);
    expect(landingCss).toMatch(/\.mb-inv-h2 \{[^}]*font-weight: 800;/s);
    // and the shared .mb-h2 head agrees, so no band is an outlier
    expect(landingCss).toMatch(/\.mb-h2 \{[^}]*font-weight: 800;/s);
  });

  it("drops the stray Georgia quote-mark family — stays on the display face (audit #9)", () => {
    expect(landingCss).not.toContain("Georgia");
    expect(landingCss).toMatch(/\.mb-quote-mark \{[^}]*font-family: var\(--mb-font-display\);/s);
  });

  it("raises the sub-legible /why-mobeeli labels above the 10px floor (audit #10)", () => {
    expect(landingCss).not.toContain("font-size: 9.5px");
  });

  it("caps the why-Mobeeli paragraph measure (audit #8)", () => {
    expect(landingCss).toMatch(/\.mb-why-p \{[^}]*max-width: 640px;/s);
  });
});

describe("R8 · motion & interaction", () => {
  it("replaces the funnel chip's `transition: all` with enumerated props (audit #21)", () => {
    expect(landingCss).not.toContain("transition: all");
    expect(globalsCss).toContain("--mb-ease-standard: cubic-bezier(0.2, 0.6, 0.2, 1);");
  });

  it("interpolates the overlay-nav blur instead of popping it (audit #4)", () => {
    expect(landingCss).toMatch(
      /\.mb-nav--overlay:not\(\.is-solid\) \{[^}]*backdrop-filter: blur\(0\) saturate\(1\);/s,
    );
    expect(landingCss).toMatch(/\.mb-nav--overlay \{\s*transition:[^}]*backdrop-filter 0\.3s ease;/s);
  });

  it("gives the non-magnetic buttons a reduced-motion-gated pressed state (audit #23)", () => {
    expect(landingCss).toMatch(/\.mb-btn-primary-light:active[^}]*\{[^}]*transform: translateY\(1px\);/s);
  });
});

describe("R8 · responsive & mobile", () => {
  it("ships the html/body overflow-x clip safety belt (audit #5)", () => {
    expect(globalsCss).toMatch(/html,\s*body \{[^}]*overflow-x: clip;/s);
  });

  it("hardens the rotating H1 against long-word overflow (audit #19)", () => {
    expect(landingCss).toMatch(/\.mb-hero-h1 > span \{[^}]*overflow-wrap: anywhere;[^}]*min-width: 0;/s);
    expect(globalsCss).toMatch(/h1,\s*h2,\s*h3 \{[^}]*overflow-wrap: anywhere;/s);
  });

  it("raises the mobile language toggle to the 44px touch floor (audit #12)", () => {
    expect(landingCss).toMatch(/\.mb-nav-sheet \.mb-lang-btn \{[^}]*min-height: 44px;/s);
  });
});



describe("R8 · macrostructure & copy", () => {
  it("retires the eyebrow kicker on the front-page narrative bands (audit #1)", () => {
    const prob = render(<ProblemSection />);
    const how = render(<AiCatalogCard />);
    // R28 (2026-07-29) reintroduced an eyebrow on the problem band BY DESIGN
    // (.mb-prob-eyebrow, part of the depth-plane composition) — audit #1's
    // ban continues to hold for the generic .mb-kicker treatment it was
    // actually about.
    expect(prob).not.toContain("mb-kicker");
    expect(how).not.toContain("mb-kicker");
    // The H2s still lead their bands (R28 renamed the problem H2's class).
    expect(prob).toContain("mb-prob-h2");
    expect(how).toContain(t("en", "cat_h2"));
    // The copy keys stay defined in both languages (unused, harmless).
    for (const lang of langs) {
      expect(t(lang, "prob_kicker")).toBeTruthy();
      expect(t(lang, "how_kicker")).toBeTruthy();
    }
  });

  it("removes the footer's dead placeholder social link (audit #7)", () => {
    const footer = render(<Footer />);
    expect(footer).not.toContain("mb-footer-social");
    expect(footer).not.toContain('href="#"');
  });

  it("wires the WCAG 2.2.2 headline pause control with both-language labels (audit #24)", () => {
    const hero = render(<HeroRotator />);
    expect(hero).toContain('class="mb-hero-pause"');
    expect(hero).toContain('aria-pressed="false"');
    for (const lang of langs) {
      expect(t(lang, "hero_pause")).toBeTruthy();
      expect(t(lang, "hero_resume")).toBeTruthy();
      expect(t(lang, "hero_pause")).not.toBe(t(lang, "hero_resume"));
    }
    // Hidden until keyboard focus, then a fixed pill below the nav.
    expect(landingCss).toMatch(/\.mb-hero-pause \{[^}]*clip: rect\(0 0 0 0\);/s);
    expect(landingCss).toMatch(/\.mb-hero-pause:focus-visible \{[^}]*position: fixed;/s);
  });

  it("localizes the ID copy slips and de-guarantees the fitment chip (audits #6, #17, #25)", () => {
    expect(t("id", "card_part_chip")).toBe("✓ Dipastikan cocok");
    // 2026-07-30 founder directive put the ID translations in: audit #6's
    // localization rule resumes — the ID heading is Indonesian again (DRAFT
    // pending the founder's native review).
    // ID COPY PASS 2026-08-01: still Indonesian, so audit #6's rule is intact
    // — only the register changed. "Kenalan" is the colloquial/spoken form
    // (KBBI marks it informal for "berkenalan") and clashed with the site's
    // formal "Anda" voice; "Kenali tim kami." is the formal imperative.
    expect(t("id", "team_h2")).toBe("Kenali tim kami.");
    expect(t("id", "prob_t1_v")).toBe("19,4%");
    expect(t("id", "prob_t1_v")).not.toContain(".");
    // EN "RMA" card realigned to its actual counterfeit meaning; ID unchanged.
    expect(t("en", "why_ds_c2_t")).not.toContain("RMA");
    // See analog-deathspiral-port.test.tsx: "injeksi" collided with fuel
    // injection on an auto-parts page.
    expect(t("id", "why_ds_c2_t")).toBe("Banjir Suku Cadang KW");
  });
});

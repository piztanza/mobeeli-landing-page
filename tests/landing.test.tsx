import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LandingPage from "@/app/page";
import { copy, langs, t } from "@/lib/i18n";

/**
 * Every landing data-i18n key from the approved design (Mobeeli
 * Landing.dc.html TXT map) — the i18n completeness contract for F-001.
 */
const LANDING_KEYS = [
  "nav_problem",
  "nav_how",
  "nav_why",
  "nav_early",
  "nav_team",
  "nav_inv",
  "nav_cta",
  "hero_chip",
  "hero_sub",
  "hero_sub_short",
  "hero_cta_inv",
  "hero_cta_shops",
  "card_part_name",
  "card_part_sub",
  "card_part_chip",
  "card_fit",
  "card_video_cap",
  "pf1_v",
  "pf1_l",
  "pf2_v",
  "pf2_l",
  "pf3_v",
  "pf3_l",
  "pf4_v",
  "pf4_l",
  "prob_kicker",
  "prob_h2",
  "prob_t1_t",
  "prob_t1_l",
  "prob_t2_t",
  "prob_t2_l",
  "prob_t3_v",
  "prob_t3_t",
  "prob_t3_l",
  "prob_t3_chip",
  "quote_main",
  "quote_en",
  "quote_by",
  "cat_unified_h2",
  "prot_r1",
  "prot_r2",
  "prot_r3",
  "cmp_h",
  "cmp_bad_t",
  "cmp_bad_1",
  "cmp_bad_2",
  "cmp_bad_3",
  "cmp_bad_4",
  "cmp_bad_res",
  "cmp_good_t",
  "cmp_good_1",
  "cmp_good_2",
  "cmp_good_3",
  "cmp_good_4",
  "cmp_good_res",
  "why_kicker",
  "why_h2",
  "why_p",
  "early_kicker",
  "early_h2",
  "early_f1_t",
  "early_f1_d",
  "early_f2_t",
  "early_f2_d",
  "early_f3_t",
  "early_f3_d",
  "early_cta",
  "early_note",
  "buyer_line",
  "buyer_cta",
  "team_kicker",
  "team_h2",
  "team_c1",
  "team_c2",
  "team_c3",
  "inv_kicker",
  "inv_h2",
  "inv_p",
  "inv_cta",
  "inv_or",
  "cat_h2",
  "cat_p",
  "cat_pill",
  "cat_ai_read",
  "cat_ai_done",
  "scn1",
  "scn2",
  "scn3",
  "scn4",
  "scn5",
  "scn6",
  "uni_kicker",
  "uni_h2",
  "uni_p",
  "uni_drag",
  "foot_tag",
] as const;

describe("landing i18n completeness (F-001)", () => {
  it("has every approved landing key in both languages", () => {
    for (const lang of langs) {
      const map = copy[lang] as Record<string, string>;
      for (const key of LANDING_KEYS) {
        expect(map[key], `${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it("keeps the approved copy verbatim (spot checks incl. typography)", () => {
    expect(t("en", "hero_chip")).toBe("Launching 2026 — Jakarta, Indonesia");
    expect(t("en", "hero_sub")).toContain("trust infrastructure for Indonesia's $5.3B");
    expect(t("id", "hero_sub")).toContain("infrastruktur kepercayaan");
    expect(t("en", "prob_t3_v")).toBe("16.75–19.66%");
    expect(t("id", "prob_t3_v")).toBe("16,75–19,66%");
    expect(t("en", "card_part_chip")).toBe("✓ Verified fit");
    expect(t("id", "card_part_chip")).toBe("✓ Dipastikan cocok");
    expect(t("en", "cat_pill")).toBe("✓ One catalog · 120M+ mappings (Simulation)");
    expect(t("id", "why_p")).toContain("Mei 2026");
    expect(t("en", "early_kicker")).toBe("Early Adopters Program");
    expect(t("id", "uni_h2")).toBe("Dari Sabang sampai Merauke, satu katalog.");
  });

  it("keeps the slim-landing copy broad — deck thesis line, no figures (redesign phase 4)", () => {
    expect(t("en", "hero_sub_short")).toContain("verified catalog for Indonesia's auto industry");
    expect(t("id", "hero_sub_short")).toContain("katalog terverifikasi untuk industri otomotif Indonesia");
    // Founder direction: no market sizes or moat counts on the front page.
    for (const lang of langs) {
      expect(t(lang, "hero_sub_short")).not.toMatch(/\d/);
    }
  });
});

/** Escape a copy string the way React escapes text content in SSR output. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("landing page render (F-001 + F-009)", () => {
  const html = renderToStaticMarkup(<LandingPage />);

  it("renders every anchored section of the slim stack — why-now left for /why-mobeeli", () => {
    for (const id of ["top", "problem", "how-it-works"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).not.toContain('id="why-now"');
  });

  it("no longer renders the sections moved to their own routes (CHG-piztanza-09 + redesign)", () => {
    for (const id of ["early-adopter", "team", "investors"]) {
      expect(html).not.toContain(`id="${id}"`);
    }
    expect(html).not.toContain(esc(t("en", "early_h2")));
    expect(html).not.toContain(esc(t("en", "team_h2")));
    expect(html).not.toContain(esc(t("en", "inv_h2")));
    // Data bands moved to /why-mobeeli (the AI catalog demo is back on /).
    expect(html).not.toContain(esc(t("en", "why_h2")));
    expect(html).not.toContain(esc(t("en", "pf1_l")));
    expect(html).not.toContain(esc(t("en", "prob_t1_t")));
    expect(html).not.toContain(esc(t("en", "cmp_h")));
    // The long stat-bearing hero sub is replaced by the broad deck thesis.
    expect(html).not.toContain(esc(t("en", "hero_sub")));
    expect(html).toContain(esc(t("en", "hero_sub_short")));
  });

  it("renders the R18 band order — catalog second, no protection band", () => {
    const bands = [
      t("en", "hero_chip"), // hero (dark, full viewport)
      t("en", "cat_unified_h2"), // unified catalog (dark, id="how-it-works")
      t("en", "quote_main"), // the problem, slim (light, id="problem")
      t("en", "uni_h2"), // coverage / archipelago (dark, id="coverage")
      t("en", "buyer_line"), // buyer strip (id="waitlist")
      t("en", "foot_tag"), // footer
    ];
    let cursor = -1;
    for (const band of bands) {
      const at = html.indexOf(esc(band));
      expect(at, `band copy "${band}"`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it("gives every band an id, and drops the second competing catalog (R16 ruling 1a)", () => {
    for (const id of ["how-it-works", "problem", "coverage", "waitlist"]) {
      expect(html, `id="${id}"`).toContain(`id="${id}"`);
    }
    // AiCatalogCard is unmounted from `/` — its headline must not appear.
    expect(html).not.toContain(esc(t("en", "cat_h2")));
  });

  // R18 call A. The failure mode this invites is silent re-addition, so guard the
  // absence explicitly rather than relying on the band-order test to notice.
  it("keeps the protection band off the front page (R18 call A)", () => {
    expect(html).not.toContain('id="protection"');
    expect(html).not.toContain('href="/#protection"');
    expect(html).not.toContain(esc(t("en", "how_s3_t")));
  });

  it("keeps the desktop nav at five links (R18 call A freed a slot)", () => {
    const bar = html.match(/<div class="mb-nav-links">.*?<\/div>/s)?.[0] ?? "";
    expect(bar, "nav-links container").not.toBe("");
    // Count hrefs rather than tags: Link renders as <a>, but the external
    // platform link is a plain <a>, so an element-name regex is brittle.
    expect((bar.match(/href=/g) ?? []).length).toBe(5);
  });

  it("wires the nav waitlist CTA to /join and the hero shop CTA to platform registration", () => {
    expect(html).toContain('href="/join"');
    expect(html).toContain('href="https://mobilee-demo.vercel.app/platform/join"');
    expect(html).toContain('href="/investors"');
  });

  it("points the nav links at the routes, /#id anchors and the external platform", () => {
    for (const href of [
      "/#problem",
      "/#how-it-works",
      "https://mobilee-demo.vercel.app/platform",
      "/team",
      "/investors",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("upgrades the buyer mailto to the inline notify capture (F-015, CHG-piztanza-13)", () => {
    // The F-009 buyer mailto is superseded — the CTA is now a button expanding an inline
    // email field. (The footer's plain contact mailto is unrelated and stays.)
    expect(html).not.toContain(
      "mailto:info@mobeeli.com?subject=Notify%20me%20at%20launch%20%E2%80%94%20buyer",
    );
    const cta = html.match(/<button[^>]*mb-buyer-cta[^>]*>/)?.[0] ?? "";
    expect(cta).toContain('type="button"');
    expect(cta).toContain('aria-expanded="false"');
  });

  it("pads the AI catalog band 96px top and bottom (CHG-piztanza-14, CSS contract)", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );
    const globalsCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
    expect(globalsCss).toContain("--mb-section-y: 96px;");
    expect(landingCss).toMatch(
      /\.mb-cat-section \{[^}]*padding: var\(--mb-section-y\) var\(--mb-container-pad\);/s,
    );
  });

  it("ships the scrollspy at rest — no nav link is marked active in server markup (CHG-piztanza-14)", () => {
    expect(html).not.toContain("aria-current");
    expect(html).not.toContain("data-active");
  });

  it("uses the official logo variants — both in the overlay nav (CSS swap), white in the footer", () => {
    expect(html).toContain("mobeeli-logo-blue.png");
    expect(html).toContain("mobeeli-logo-white.png");
    const footer = html.slice(html.indexOf('class="mb-footer"'));
    expect(footer).toContain("mobeeli-logo-white.png");
  });
});

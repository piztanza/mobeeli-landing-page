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
  "how_kicker",
  "how_h2",
  "how_s1_t",
  "how_s1_d",
  "ymm_y",
  "ymm_mk",
  "ymm_md",
  "ymm_tr",
  "how_s2_t",
  "how_s2_d",
  "fit_r1",
  "fit_r2",
  "fit_r3",
  "how_s3_t",
  "how_s3_d",
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
    expect(t("id", "card_part_chip")).toBe("✓ Dijamin cocok");
    expect(t("en", "cat_pill")).toBe("✓ One catalog · 120M+ mappings");
    expect(t("id", "why_p")).toContain("Mei 2026");
    expect(t("en", "early_kicker")).toBe("Early Adaptors Program");
    expect(t("id", "uni_h2")).toBe("Dari Sabang sampai Merauke, satu katalog.");
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

  it("renders every anchored section of the approved stack", () => {
    for (const id of [
      "top",
      "problem",
      "how-it-works",
      "why-now",
      "early-adaptor",
      "team",
      "investors",
    ]) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("renders the full band stack copy in the approved order", () => {
    const bands = [
      t("en", "hero_chip"), // hero
      t("en", "pf1_v"), // proof bar
      t("en", "prob_h2"), // the problem
      t("en", "how_h2"), // how it works
      t("en", "buyer_line"), // buyer strip
      t("en", "why_h2"), // why Mobeeli
      t("en", "cat_h2"), // AI catalog
      t("en", "early_h2"), // early adaptors
      t("en", "team_h2"), // team
      t("en", "inv_h2"), // investors
      t("en", "uni_h2"), // unify band
      t("en", "foot_tag"), // footer
    ];
    let cursor = -1;
    for (const band of bands) {
      const at = html.indexOf(esc(band));
      expect(at, `band copy "${band}"`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it("wires both waitlist CTAs to /join (F-009)", () => {
    expect(html.match(/href="\/join"/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("uses the approved buyer and investor mailtos and founder emails (F-009)", () => {
    expect(html).toContain(
      "mailto:info@mobeeli.com?subject=Notify%20me%20at%20launch%20%E2%80%94%20buyer",
    );
    expect(html).toContain("mailto:info@mobeeli.com?subject=Mobeeli%20%E2%80%94%20deck%20request");
    for (const email of ["matheau@mobeeli.com", "hafizh@mobeeli.com", "ferdi@mobeeli.com"]) {
      expect(html).toContain(`mailto:${email}`);
    }
  });

  it("uses the official logo variants — blue on light nav, white on dark footer", () => {
    expect(html).toContain("mobeeli-logo-blue.png");
    expect(html).toContain("mobeeli-logo-white.png");
  });

  it("renders the floating hero cards over the scene container", () => {
    expect(html).toContain(t("en", "card_part_name"));
    expect(html).toContain(t("en", "card_fit"));
    const video = html.match(/<video[^>]*>/)?.[0] ?? "";
    expect(video).toContain("unify-graph.mp4");
    expect(video).toContain("muted");
    expect(video).toContain("loop");
    expect(video.toLowerCase()).toContain("playsinline");
  });
});

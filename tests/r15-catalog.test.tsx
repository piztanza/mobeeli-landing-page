import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentSection from "@/components/landing/FitmentSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

/**
 * R15 unified-catalog contract (salvaged). The raw R15 shipped green-by-deletion
 * — it removed the contract tests for the features it replaced and added only
 * thin source-string checks. This is the honest replacement: it pins the new
 * catalog's structure, honesty (Simulation labels), i18n, contrast, perf
 * (next/image), type-safety, and the class-collision fix.
 */

const src = readFileSync(
  new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
  "utf8",
);
const css = readFileSync(new URL("../src/components/landing/landing.css", import.meta.url), "utf8");
const html = renderToStaticMarkup(
  <LanguageProvider>
    <FitmentSection />
  </LanguageProvider>,
);

describe("R15 catalog — structure", () => {
  it("renders the catalog section with the 4 real part cards + honest sim tags", () => {
    expect(html).toContain('id="how-it-works"');
    for (const img of ["spark-plug.jpg", "clutch.jpg", "shock.jpg", "brake-pad.jpg"]) {
      expect(src).toContain(img);
    }
    expect(html).toContain(t("en", "cat_part1_name"));
  });

  // R16 ruling 2b: cards carry a fitment SPEC, not a simulated price — no
  // prices, ever. That half is permanent.
  //
  // The Simulation tag, however, is BACK on this surface, and deliberately.
  // FOUNDER RULING 2026-07-28: the R25 mockup's result line ("4 of 217 fit your
  // car · 213 hidden") reinstates illustrative counts, ON CONDITION that they
  // carry cat_sim_tag — the same compromise R15 originally set. So the tag must
  // RENDER here; its absence would mean the page is asserting a measured
  // catalogue size, which is the thing ruling 2b actually forbade.
  //
  // cat_part4_spec is no longer rendered: R25 replaced the fourth card with the
  // deliberately non-fitting one (cat_part5_*). The key stays defined and paired
  // in copy.ts, same precedent as prot_r*.
  it("shows fitment specs instead of simulated prices, and labels the counts", () => {
    for (const k of [
      "cat_part1_spec",
      "cat_part2_spec",
      "cat_part3_spec",
      "cat_part5_spec",
    ] as const) {
      expect(html, k).toContain(t("en", k));
      for (const lang of langs) expect(t(lang, k), `${lang}.${k}`).toBeTruthy();
    }
    expect(html).not.toContain("Rp ");
    expect(html, "illustrative counts must stay labelled").toContain(t("en", "cat_sim_tag"));
  });

  it("keeps the ambient aurora but has no 3D wheel / three-fiber import", () => {
    expect(src).toContain("AmbientAurora");
    expect(src).not.toContain("FitmentWheel");
    expect(src).not.toContain("@react-three/fiber");
  });
});

describe("R15 catalog — hardening (perf, type-safety, no green)", () => {
  it("uses next/image, not a raw <img>, for the heavy catalog assets", () => {
    expect(src).toContain('from "next/image"');
    expect(src).not.toMatch(/<img\s/);
  });

  it("has no `as any` casts", () => {
    expect(src).not.toContain("as any");
  });

  /**
   * R15 banned emerald and indigo outright. FOUNDER RULING 2026-07-28 narrowed
   * that: the catalogue's success chip is green because green is what "this
   * fits" means, and the R25 design is built on it. The rule is not dropped —
   * green is permitted ONLY on the verified chip, by exact token, and indigo
   * stays banned entirely. Anything else green still fails, which is the point:
   * a semantic exception, not an open palette.
   */
  it("permits green only as the verified-fit signal, and still bans indigo", () => {
    const combined = (src + css).toLowerCase();

    // Indigo was never re-litigated.
    expect(combined, "indigo is still banned").not.toContain("#818cf8");

    // Every green occurrence must sit inside the verified/unfit chip rules.
    const allowed = [
      "rgba(16, 185, 129, 0.13)", // verified chip fill
      "rgba(16, 185, 129, 0.3)", // verified chip border
      "#34d399", // verified chip text
      "#10b981", // the chip's solid verdict dot (grid-fidelity pass) — same exception
    ];
    const greenHits = (css.match(/#10b981|#34d399|rgba\(16, ?185, ?129[^)]*\)/gi) ?? []).map((s) =>
      s.toLowerCase(),
    );
    for (const hit of greenHits) {
      expect(
        allowed.some((a) => a.replace(/\s/g, "") === hit.replace(/\s/g, "")),
        `unexpected green token ${hit} — green is reserved for the verified chip`,
      ).toBe(true);
    }
    // And the component source stays free of hardcoded colour entirely.
    expect(src).not.toContain("#10b981");
    expect(src).not.toContain("#34d399");
  });
});

describe("R15 catalog — i18n & honesty", () => {
  it("routes the filter label + car alt through copy.ts (no hardcoded UI strings)", () => {
    expect(src).not.toContain(">Filter Active<");
    expect(src).not.toContain("Catalog Car Blueprint");
    for (const lang of langs) {
      expect(t(lang, "cat_filter_active")).toBeTruthy();
      expect(t(lang, "cat_car_alt")).toBeTruthy();
    }
  });

  it("labels every catalog number as a Simulation (honesty contract)", () => {
    expect(t("en", "cat_sim_tag")).toBe("(Simulation)");
    expect(t("id", "cat_sim_tag")).toBe("(Simulasi)");
  });

  // R16 ruling 2b: the landing page is a company profile, not a pitch deck. The
  // simulated catalogue-size tiles are gone and must not come back — the honesty
  // fix for a fabricated figure is to remove it, not to label it.
  it("ships no catalogue-size stat tiles at all", () => {
    const copySrc = readFileSync(new URL("../src/lib/i18n/copy.ts", import.meta.url), "utf8");
    expect(copySrc).not.toContain("cat_unified_stat");
    expect(src).not.toContain("mb-cat-stats");
    expect(css).not.toContain(".mb-cat-stat");
  });
});

describe("R15 catalog — CSS contracts (contrast + no class collision)", () => {
  it("uses collision-free classes (was clobbered by AiCatalogCard's .mb-cat-card)", () => {
    expect(css).toContain(".mb-ucat-card {");
    expect(css).toContain(".mb-ucat-h2 {");
    expect(src).toContain("mb-ucat-card");
    expect(src).toContain("mb-ucat-h2");
  });

  it("keeps secondary catalog text legible on the dark surface (dark-muted, not light-band muted)", () => {
    // (.mb-cat-stat-l was dropped in R16 with the stat tiles; .mb-cat-card-brand
    // went in the R25 grid-fidelity pass — the mockup's cards carry
    // chip → name → spec with no brand line, so the rule this pinned is gone.
    // The spec line inherits the same duty and is pinned instead.)
    expect(css).toMatch(
      /\.mb-cat-card-spec \{[^}]*color: var\(--mb-light-accent\)|\.mb-cat-card-spec \{[^}]*color: var\(--mb-dark-muted\);/s,
    );
    expect(css).toMatch(/\.mb-sim-tag \{[^}]*color: var\(--mb-dark-muted\);/s);
    expect(css, "brand rule stays retired").not.toMatch(/^\.mb-cat-card-brand \{/m);
  });
});

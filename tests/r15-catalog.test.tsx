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
const css = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
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
    expect(html).toContain(t("en", "cat_sim_tag")); // "(Simulation)"
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

  it("introduces no banned emerald/indigo hexes", () => {
    const combined = (src + css).toLowerCase();
    expect(combined).not.toContain("#10b981");
    expect(combined).not.toContain("#34d399");
    expect(combined).not.toContain("#818cf8");
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
    // (.mb-cat-stat-l was dropped in R16 with the stat tiles.)
    expect(css).toMatch(/\.mb-cat-card-brand \{[^}]*color: var\(--mb-dark-muted\);/s);
    expect(css).toMatch(/\.mb-sim-tag \{[^}]*color: var\(--mb-dark-muted\);/s);
  });
});

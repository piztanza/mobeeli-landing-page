import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Proposal Q2 — Dark-Band Material System", () => {
  it("defines dark elevation tokens and 4-layer shadow in globals.css", () => {
    const globalsCss = readFileSync(
      new URL("../src/app/globals.css", import.meta.url),
      "utf8",
    );

    expect(globalsCss).toContain("--mb-ink-dp1: #0a1019;");
    expect(globalsCss).toContain("--mb-ink-dp2: #111927;");
    expect(globalsCss).toContain("--mb-ink-dp3: #16202f;");
    expect(globalsCss).toContain("--mb-hairline-subtle: rgba(255, 255, 255, 0.08);");
    expect(globalsCss).toContain("--mb-shadow-linear-4layer:");
    expect(globalsCss).toContain("inset 0 0 0 1px rgba(255, 255, 255, 0.03)");
  });

  it("applies film grain to every REAL dark surface with correct anchoring", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    // Audit contract: selectors must match real band classes — the archipelago
    // band is .mb-uni and the dark catalog surface is .mb-cat-card (its light
    // section wrapper must NOT get grain).
    expect(landingCss).toMatch(/\.mb-hero::after,\s*\.mb-uni::after,\s*\.mb-cat-card::after \{/);
    expect(landingCss).not.toContain(".mb-unify-section");
    expect(landingCss).not.toContain(".mb-cat-section::after");
    // Verified Raycast recipe: fine grain, not coarse blobs.
    expect(landingCss).toContain("baseFrequency='3'");
    expect(landingCss).toContain("mix-blend-mode: overlay;");
    // Grain overlays are absolute — every host must be its positioning context.
    expect(landingCss).toMatch(/\.mb-uni \{[^}]*position: relative;/s);
    // The 4-layer shadow has a real consumer: the funnel simulator panel.
    expect(landingCss).toMatch(/\.mb-funnel-sim \{[^}]*var\(--mb-shadow-linear-4layer\)/s);
  });
});

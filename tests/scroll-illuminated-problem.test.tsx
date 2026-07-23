import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProblemSection from "@/components/landing/ProblemSection";
import { copy } from "@/lib/i18n";

describe("Proposal Q3 — Scroll-Illuminated Problem Statement", () => {
  it("renders per-word .mb-word-illuminate spans with --word-i style property", () => {
    const html = renderToStaticMarkup(<ProblemSection />);
    expect(html).toContain('class="mb-word-illuminate"');
    expect(html).toContain('style="--word-i:0"');

    // Verify exact copy content is preserved
    const approvedText = copy.en.prob_h2;
    const words = approvedText.split(" ");
    for (const word of words) {
      expect(html).toContain(word);
    }
  });

  it("defines CSS rules for animation-timeline: view() and reduced motion in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-word-illuminate {");
    expect(landingCss).toContain("animation-timeline: view();");
    expect(landingCss).toContain("animation-range:");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.mb-word-illuminate\s*\{[^}]*opacity:\s*1\s*!important;/,
    );
  });
});

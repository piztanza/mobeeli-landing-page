import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { SCAN_DURATION_MS } from "@/components/landing/FitmentSection";

/**
 * R16 Bugs A + B — the scan sweep.
 *
 * Bug A: `.is-scanning` was applied by FitmentSection but appeared ZERO times in
 * landing.css, while `.mb-cat-scan-line` carried `animation: … infinite`
 * unconditionally. The "scan animation" was permanent idle motion.
 *
 * Bug B: that infinite animation had no `prefers-reduced-motion` gate at all.
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

/** The body of every `@media (prefers-reduced-motion: reduce)` block. */
function reducedMotionBlocks(css: string): string {
  const out: string[] = [];
  const marker = "@media (prefers-reduced-motion: reduce)";
  for (let at = css.indexOf(marker); at >= 0; at = css.indexOf(marker, at + 1)) {
    let depth = 0;
    let i = css.indexOf("{", at);
    const start = i;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    out.push(css.slice(start, i));
  }
  return out.join("\n");
}

describe("Bug A — the sweep only runs during an actual scan", () => {
  it("gates the animation behind .is-scanning, which the component really sets", () => {
    expect(landingCss).toMatch(
      /\.mb-cat-car-wrapper\.is-scanning \.mb-cat-scan-line \{[^}]*animation: mb-cat-scan/s,
    );
    const component = readFileSync(
      new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
      "utf8",
    );
    expect(component).toContain("is-scanning");
  });

  it("never animates infinitely — one pass per scan", () => {
    expect(landingCss).not.toMatch(/\.mb-cat-scan-line \{[^}]*animation:[^;]*infinite/s);
    expect(landingCss).toMatch(/animation: mb-cat-scan \d+ms linear 1 forwards;/);
  });

  it("is invisible at rest", () => {
    expect(landingCss).toMatch(/\.mb-cat-scan-line \{[^}]*opacity: 0;/s);
  });
});

describe("Bug B — reduced motion is respected", () => {
  it("suppresses the sweep under prefers-reduced-motion", () => {
    expect(reducedMotionBlocks(landingCss)).toMatch(
      /\.mb-cat-car-wrapper\.is-scanning \.mb-cat-scan-line \{[^}]*animation: none;/s,
    );
  });
});

describe("timing contract — CSS and TypeScript cannot drift apart", () => {
  it("authors the sweep to exactly SCAN_DURATION_MS", () => {
    // They were 1.5s (CSS) vs 1800ms (TS), so the sweep was cut off mid-pass.
    const match = landingCss.match(/animation: mb-cat-scan (\d+)ms linear 1 forwards;/);
    expect(match, "sweep duration declaration").not.toBeNull();
    expect(Number(match![1])).toBe(SCAN_DURATION_MS);
  });
});

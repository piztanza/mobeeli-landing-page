import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AiCatalogCard from "@/components/landing/AiCatalogCard";
import HeroRotator from "@/components/landing/HeroRotator";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ROTATION_PAIRS } from "@/lib/i18n/rotation";

/**
 * Cross-device visual fixes from the live-site screenshot review
 * (CHG-piztanza-18). Layout rules are asserted as CSS contracts on
 * landing.css (the established pattern for breakpoint behavior in this
 * suite); DOM-level fixes are asserted on rendered markup.
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

/** All `@media (max-width: <query>)` block bodies in the stylesheet. */
function mediaBlocks(css: string, query: string): string[] {
  const marker = `@media (max-width: ${query})`;
  const blocks: string[] = [];
  for (let at = css.indexOf(marker); at >= 0; at = css.indexOf(marker, at + 1)) {
    // scan to the matching closing brace of the media block
    let depth = 0;
    let i = css.indexOf("{", at);
    const start = i;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    blocks.push(css.slice(start, i));
  }
  expect(blocks.length, `${marker} blocks`).toBeGreaterThan(0);
  return blocks;
}

/** The single media block for `query` that styles `selector`. */
function mediaBlockFor(css: string, query: string, selector: string): string {
  const block = mediaBlocks(css, query).find((b) => b.includes(selector));
  expect(block, `@media (max-width: ${query}) block styling ${selector}`).toBeDefined();
  return block ?? "";
}

describe("product cards docked in the fitment band (R4, supersedes CHG-piztanza-18)", () => {
  it("cards are relative in a wrapping flex row — the absolute overlay is gone", () => {
    expect(landingCss).toMatch(/\.mb-herocard \{[^}]*position: relative;/s);
    expect(landingCss).toMatch(/\.mb-fit3d-cards \{[^}]*display: flex;[^}]*flex-wrap: wrap;/s);
    expect(landingCss).toMatch(/\.mb-fit3d-stage \{[^}]*margin: 26px auto 0;/s);
  });

  it("no card carries absolute offsets at any viewport", () => {
    expect(landingCss).not.toMatch(/\.mb-card-part \{[^}]*(?:top|left|right|bottom): /s);
    expect(landingCss).not.toMatch(/\.mb-card-video \{[^}]*(?:top|left|right|bottom): /s);
  });
});

describe("fit pill in the docked row (R4, supersedes CHG-piztanza-18)", () => {
  it("no longer overlays the scene — it self-centers in the card row", () => {
    // The old overlay offset (bottom: 24px vs the projected label) is gone;
    // the pill can never collide with the scene's labels again.
    expect(landingCss).not.toMatch(/\.mb-card-fit \{[^}]*bottom: /s);
    expect(landingCss).toMatch(/\.mb-card-fit \{[^}]*align-self: center;/s);
  });
});

describe("part card price row (CHG-piztanza-18)", () => {
  it("keeps 'Rp 385.000' on one line", () => {
    expect(landingCss).toMatch(/\.mb-card-part-price \{[^}]*white-space: nowrap;/s);
  });

  it("balances price against the Verified-fit chip and lets the card fit its content", () => {
    expect(landingCss).toMatch(/\.mb-card-part-row \{[^}]*justify-content: space-between;/s);
    expect(landingCss).toMatch(/\.mb-card-part \{[^}]*width: auto;[^}]*max-width: 272px;/s);
  });
});

describe("hero H1 reserved height via pair sizers (CHG-piztanza-18)", () => {
  const html = renderToStaticMarkup(
    <LanguageProvider>
      <HeroRotator />
    </LanguageProvider>,
  );

  it("renders every rotation pair as an invisible sizer plus the live pair", () => {
    const sizers = html.match(/mb-hero-h1-sizer/g) ?? [];
    expect(sizers).toHaveLength(ROTATION_PAIRS.en.length);
    for (const [line1, line2] of ROTATION_PAIRS.en) {
      expect(html).toContain(line1);
      expect(html).toContain(line2);
    }
    expect(html).toContain("mb-hero-h1-live");
    // sizers are presentation-only
    const sizer = html.match(/<span[^>]*mb-hero-h1-sizer[^>]*>/)?.[0] ?? "";
    expect(sizer).toContain("aria-hidden");
  });

  it("drops the hardcoded min-height — the sizers reserve the exact height", () => {
    expect(html).not.toContain("min-height");
    expect(landingCss).not.toMatch(/\.mb-hero-h1 \{[^}]*min-height/s);
  });

  it("grid-stacks sizers and live pair in one cell so the tallest pair sizes the H1", () => {
    expect(landingCss).toMatch(/\.mb-hero-h1 \{[^}]*display: grid;/s);
    expect(landingCss).toMatch(/\.mb-hero-h1 > span \{[^}]*grid-area: 1 \/ 1;/s);
    expect(landingCss).toMatch(/\.mb-hero-h1-sizer \{[^}]*visibility: hidden;/s);
  });
});

describe("AI catalog file chips (CHG-piztanza-18)", () => {
  it("ships all three icon assets", () => {
    for (const name of ["xls2.png", "pdf2.png", "jpg2.png"]) {
      const path = new URL(`../public/assets/icons/${name}`, import.meta.url);
      expect(existsSync(path), name).toBe(true);
    }
  });

  it("renders XLS, PDF and JPG chips with verbatim (unoptimized) srcs", () => {
    const html = renderToStaticMarkup(<AiCatalogCard static />);
    for (const name of ["xls2.png", "pdf2.png", "jpg2.png"]) {
      // unoptimized next/image keeps the raw static src — no optimizer
      // round-trip that could drop a chip on the live site
      expect(html).toContain(`src="/assets/icons/${name}"`);
    }
  });
});

describe("phone catalog stage and unify map (CHG-piztanza-18)", () => {
  const block = mediaBlockFor(landingCss, "639.98px", ".mb-cat-stage");

  it("tightens the stage to 4:3 with proportionally larger sprites", () => {
    expect(block).toMatch(/\.mb-cat-stage \{[^}]*aspect-ratio: 4\/3;/s);
    for (const [sprite, width] of [
      ["pad", "38%"],
      ["filter", "33%"],
      ["plug", "29%"],
      ["disc", "38%"],
      ["shock", "35%"],
      ["air", "30%"],
    ] as const) {
      const rule = new RegExp(`\\.mb-sprite--${sprite} \\{[^}]*width: ${width};`, "s");
      expect(block, `sprite ${sprite}`).toMatch(rule);
    }
    // right-column sprites (left: 70%) stay inside the stage
    expect(landingCss).toMatch(/\.mb-sprite--plug \{[^}]*left: 70%;/s);
    expect(landingCss).toMatch(/\.mb-sprite--air \{[^}]*left: 70%;/s);
  });

  it("archipelago map is full-bleed with a bottom dissolve (R4, supersedes the framed map)", () => {
    expect(landingCss).toMatch(/\.mb-uni-bleed \{[^}]*position: absolute;[^}]*inset: 0;/s);
    expect(landingCss).toMatch(/\.mb-uni-bleed \{[^}]*mask-image: linear-gradient\(to bottom/s);
    expect(landingCss).toMatch(/\.mb-uni-scene \{[^}]*height: 100%;/s);
    // The copy overlay must never intercept the scene's drag interaction.
    expect(landingCss).toMatch(/\.mb-uni-inner \{[^}]*pointer-events: none;/s);
  });
});

describe("reduced motion preserved (CHG-piztanza-18)", () => {
  it("still shows the hero cards instantly under prefers-reduced-motion", () => {
    expect(landingCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.mb-herocard \{[^}]*opacity: 1;[^}]*transition: none;/s,
    );
  });

  it("still disables the rotation transition under prefers-reduced-motion", () => {
    expect(landingCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.mb-rot-line \{[^}]*transition: none;[^}]*animation: none;/s,
    );
  });
});

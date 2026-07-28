import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Liquid glass — consolidated to ONE primitive in R16.
 *
 * The previous version of this file asserted that `.mb-fit3d .mb-cat-card` and
 * `.mb-fit3d .mb-fit-protect` appeared in landing.css. They did — and they
 * matched nothing in the DOM, because those classes had been renamed/removed.
 * The test passed for weeks while the part cards had none of the treatment it
 * claimed to guarantee.
 *
 * So these assertions deliberately check BOTH sides: the rule exists in CSS AND
 * the class it targets is really applied by a component. A selector contract
 * that never touches the markup proves nothing.
 */

const landingCssRaw = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
/**
 * Comments routinely NAME selectors while explaining why they were removed, so
 * a bare `.toContain(".some-class")` over the raw file reports a rule that
 * isn't there. Assert against the stylesheet with comments stripped.
 */
const landingCss = landingCssRaw.replace(/\/\*[\s\S]*?\*\//g, "");
const fitmentSrc = readFileSync(
  new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
  "utf8",
);

/** The body of the `.mb-glass { … }` rule. */
const glassRule = landingCss.match(/\.mb-glass \{[^}]*\}/s)?.[0] ?? "";

describe("R16 — one glass primitive", () => {
  it("defines a single .mb-glass recipe", () => {
    expect(glassRule, ".mb-glass rule").not.toBe("");
    expect(glassRule).toContain("backdrop-filter: blur(22px) saturate(1.5)");
  });

  // Hand-writing both forms makes the CSS transform collapse them and keep only
  // `-webkit-backdrop-filter`, which Chromium does not support — the blur then
  // silently never renders. Let the build add prefixes.
  it("never hand-writes the -webkit- prefix (it suppresses the standard property)", () => {
    expect(landingCss).not.toContain("-webkit-backdrop-filter");
  });

  it("uses the softened specular highlight and border (not the old hard edge)", () => {
    expect(glassRule).toContain("inset 0 1px 0 rgba(255, 255, 255, 0.22)");
    expect(glassRule).toContain("border: 1px solid rgba(255, 255, 255, 0.12)");
    // The 0.4 highlight read as a hard white edge down the left side.
    expect(glassRule).not.toContain("inset 1px 1px 0 rgba(255, 255, 255, 0.4)");
  });

  it("is actually applied to the live panels — not just declared", () => {
    expect(fitmentSrc).toMatch(/className="mb-ymm-container mb-cat-ymm mb-glass"/);
    // R25 made the card's class conditional — the non-fitting result carries
    // `is-unfit` — so this matches the glass pair at the head of the list
    // rather than the whole literal attribute.
    expect(fitmentSrc).toMatch(/mb-ucat-card mb-glass/);
  });

  it("has retired the recipes that targeted classes no longer in the markup", () => {
    for (const dead of [".mb-fit3d .mb-cat-card", ".mb-fit3d .mb-fit-protect"]) {
      expect(landingCss, `${dead} should be gone`).not.toContain(dead);
    }
    // .mb-ucat-card keeps layout only; its own glass declarations are gone.
    expect(landingCss).not.toMatch(/\.mb-ucat-card \{[^}]*backdrop-filter/s);
  });

  it("degrades for prefers-reduced-transparency", () => {
    expect(landingCss).toMatch(
      /@media \(prefers-reduced-transparency: reduce\) \{\s*\.mb-glass \{[^}]*backdrop-filter: none;[^}]*background: rgba\(13, 21, 34, 0\.95\);/s,
    );
  });
});

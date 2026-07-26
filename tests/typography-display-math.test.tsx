import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Typography display math — updated for R16 (founder ruling 7a: one family).
 *
 * The page now runs entirely on the self-hosted Plus Jakarta Sans variable font
 * (200-800), so hierarchy is carried by WEIGHT rather than by a second display
 * family. Headings moved 600 -> 800: under the previous Space Grotesk display
 * face 800 was outside the axis and faux-bolded (which is exactly why R8 pinned
 * 600), but 800 is a real instance of PJS.
 */
describe("R16 type system — one family, hierarchy by weight", () => {
  const globalsCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const landingCss = readFileSync(
    new URL("../src/components/landing/landing.css", import.meta.url),
    "utf8",
  );

  it("points both font variables at the single self-hosted family", () => {
    expect(globalsCss).toMatch(/--mb-font-text:\s*var\(--mb-font\);/);
    expect(globalsCss).toMatch(/--mb-font-display:\s*var\(--mb-font\);/);
    // The brand-token contract entry itself must survive (style.json contract).
    expect(globalsCss).toContain('--mb-font: "Plus Jakarta Sans"');
  });

  it("loads no second/third family — next/font is gone from the app", () => {
    const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
    expect(layout).not.toContain("next/font");
    expect(layout).not.toContain("Space_Grotesk");
    // An unresolved var() silently falls through the stack, so it must be absent.
    expect(globalsCss).not.toContain("var(--font-inter)");
    expect(globalsCss).not.toContain("var(--font-space-grotesk)");
    expect(landingCss).not.toContain("var(--font-inter)");
    expect(landingCss).not.toContain("var(--font-space-grotesk)");
  });

  it("sets base heading weight to 800 in globals.css", () => {
    expect(globalsCss).toMatch(/h1,\s*h2,\s*h3\s*\{[^}]*font-weight:\s*800;/);
  });

  it("keeps the H1 scale and retunes weight + tracking for PJS", () => {
    expect(landingCss).toContain("clamp(2.75rem, 6.6vw, 5.25rem)");
    expect(landingCss).toContain("line-height: 1.02;");
    expect(landingCss).toMatch(/\.mb-hero-h1 \{[^}]*letter-spacing: -0\.022em;[^}]*font-weight: 800;/s);
  });

  it("puts every band H2 on the same 800 weight — class rules out-specify the element rule", () => {
    for (const sel of ["mb-h2", "mb-cat-h2", "mb-inv-h2", "mb-uni-h2"]) {
      const rule = new RegExp(`\\.${sel} \\{[^}]*font-weight: 800;`, "s");
      expect(landingCss, `.${sel} weight`).toMatch(rule);
    }
  });

  it("band 2's heading no longer overrides the shared scale (R16 hierarchy fix)", () => {
    // `font-size: 28px` here made band 2 smaller on desktop than on a phone.
    expect(landingCss).not.toMatch(/\.mb-ucat-h2 \{[^}]*font-size:/s);
    expect(landingCss).toMatch(/\.mb-h2 \{[^}]*font-size: clamp\(38px, 4\.8vw, 64px\);/s);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Proposal Q4 — Site-Wide Motion Standard", () => {
  it("defines site-wide motion tokens and double focus ring in globals.css", () => {
    const globalsCss = readFileSync(
      new URL("../src/app/globals.css", import.meta.url),
      "utf8",
    );

    expect(globalsCss).toContain("--mb-ease-entrance: cubic-bezier(0.19, 1, 0.22, 1);");
    expect(globalsCss).toContain("--mb-duration-entrance: 480ms;");
    expect(globalsCss).toContain("--mb-stagger-entrance: 70ms;");
    expect(globalsCss).toContain("--mb-ease-spring-btn:");
    // Audit ruling: the tested outline focus system stays untouched — a
    // double-ring needs per-band --ring-gap scoping, deferred to its own
    // iteration. No box-shadow may stack onto the global :focus-visible rule.
    const focusRule = globalsCss.match(/:focus-visible \{[^}]*\}/s)?.[0] ?? "";
    expect(focusRule).toContain("outline: 2px solid var(--mb-focus-ring);");
    expect(focusRule).not.toContain("box-shadow");
  });

  it("configures scroll-reveal hook with 480ms entrance, 16px rise, 70ms stagger", () => {
    const hookCode = readFileSync(
      new URL("../src/lib/hooks/useScrollReveal.ts", import.meta.url),
      "utf8",
    );

    expect(hookCode).toContain("translateY(16px)");
    expect(hookCode).toContain("480ms cubic-bezier(0.19, 1, 0.22, 1)");
    expect(hookCode).toContain("* 70}ms");
  });

  it("defines link arrow, left-in/right-out underline, and button spring in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    // HoverArrow removed in the R5 audit (no legitimate consumer twice);
    // it returns WITH its first real text-link consumer.
    expect(landingCss).not.toContain(".mb-link-arrow");
    expect(landingCss).toContain(".mb-link-underline {");
    expect(landingCss).toContain(".mb-btn-spring {");
    expect(landingCss).toContain("transform: scale(0.96);");
  });
});

import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Hero from "@/components/landing/Hero";

describe("Hypothesis C — Magnetic CTA Hover", () => {
  const html = renderToStaticMarkup(<Hero />);

  it("renders both Hero CTA links with the .mb-magnetic-cta class", () => {
    expect(html).toContain('class="mb-btn-primary-dark mb-magnetic-cta"');
    expect(html).toContain('class="mb-btn-ghost-dark mb-magnetic-cta"');
  });

  it("defines GPU-accelerated transition and reduced-motion reset in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-magnetic-cta {");
    expect(landingCss).toContain("will-change: transform;");
    expect(landingCss).toContain("transition: transform");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*transform:\s*none\s*!important;/,
    );
  });

  it("defines the useMagneticCTA hook with clamp limit and hover check", () => {
    const hookCode = readFileSync(
      new URL("../src/lib/hooks/useMagneticCTA.ts", import.meta.url),
      "utf8",
    );

    expect(hookCode).toContain("MAX_TRANSLATE_PX = 3");
    expect(hookCode).toContain("(hover: hover)");
    expect(hookCode).toContain("useReducedMotion");
    expect(hookCode).toContain("translate3d");
  });
});

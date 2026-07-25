import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AiCatalogCard from "@/components/landing/AiCatalogCard";
describe("Proposal Q1 — Cursor-Tracked Glow-Border Card System", () => {
  it("renders .mb-glow-card on AiCatalogCard", () => {
    const html = renderToStaticMarkup(<AiCatalogCard />);
    expect(html).toContain('mb-glow-card');
  });


  it("defines CSS rules for border mask and fill variant in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-glow-card {");
    expect(landingCss).toContain("mask-image: radial-gradient(");
    expect(landingCss).toContain(".mb-glow-card-fill::before {");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.mb-glow-card::after\s*\{[^}]*display:\s*none\s*!important;/,
    );
  });

  it("exports useGlowCards hook with pointermove tracking and reduced motion check", () => {
    const hookCode = readFileSync(
      new URL("../src/lib/hooks/useGlowCards.ts", import.meta.url),
      "utf8",
    );

    expect(hookCode).toContain("pointermove");
    expect(hookCode).toContain("useReducedMotion");
    expect(hookCode).toContain(".mb-glow-card");
    expect(hookCode).toContain("--mx");
    expect(hookCode).toContain("--my");
  });
});

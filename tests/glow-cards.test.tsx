import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentSection from "@/components/landing/FitmentSection";
import HowItWorks from "@/components/landing/HowItWorks";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("Proposal Q1 — Cursor-Tracked Glow-Border Card System", () => {
  it("renders .mb-glow-card on HowItWorks step cards", () => {
    const html = renderToStaticMarkup(<HowItWorks />);
    expect(html).toContain('class="mb-step-card mb-glow-card"');
  });

  it("renders .mb-glow-card and .mb-glow-card-fill on the fitment band's docked cards (R4)", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <FitmentSection />
      </LanguageProvider>,
    );
    expect(html).toContain("mb-glow-card mb-glow-card-fill");
    expect(html).toContain('class="mb-fit3d-cards"');
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

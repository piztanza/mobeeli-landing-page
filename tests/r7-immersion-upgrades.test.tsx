import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AiCatalogCard from "@/components/landing/AiCatalogCard";
import BuyerStrip from "@/components/landing/BuyerStrip";
import FitmentSection from "@/components/landing/FitmentSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("R7 Immersion Upgrades (Proposals #2, #4, #5, #7, #8)", () => {
  it("defines useTilt hook with --tilt-rx / --tilt-ry and reduced motion checks", () => {
    const hookCode = readFileSync(
      new URL("../src/lib/hooks/useTilt.ts", import.meta.url),
      "utf8",
    );

    expect(hookCode).toContain("MAX_TILT_DEG = 9");
    expect(hookCode).toContain("--tilt-rx");
    expect(hookCode).toContain("--tilt-ry");
    expect(hookCode).toContain("useReducedMotion");
    expect(hookCode).toContain("(hover: hover)");
  });

  it("useTilt HAS a consumer — the fitment stage (utilities ship WITH their first consumer)", () => {
    // Audit rule (3rd recurrence): a hook must never ship unattached. The
    // handback claimed it was attached; it was not — fixed in audit.
    const sectionCode = readFileSync(
      new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
      "utf8",
    );
    expect(sectionCode).toContain("useTilt");
    expect(sectionCode).toContain("ref={tiltRef}");
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );
    // The tilt transform lives on the SCENE, never the data-rev stage —
    // useScrollReveal leaves inline `transform: none` on revealed elements,
    // which would permanently override a stylesheet tilt there (audit-caught).
    expect(landingCss).toMatch(/\.mb-fit3d-stage \{[^}]*perspective: 1600px;/s);
    expect(landingCss).toMatch(
      /\.mb-fit3d-stage \.mb-hero-scene \{[^}]*var\(--tilt-rx, 0deg\)/s,
    );
    expect(landingCss).not.toMatch(/\.mb-fit3d-stage \{[^}]*var\(--tilt-rx/s);
  });

  it("deploys cursor glow card system on AiCatalogCard and BuyerStrip", () => {
    const aiHtml = renderToStaticMarkup(
      <LanguageProvider>
        <AiCatalogCard static />
      </LanguageProvider>,
    );
    expect(aiHtml).toContain("mb-glow-card");

    const buyerHtml = renderToStaticMarkup(
      <LanguageProvider>
        <BuyerStrip />
      </LanguageProvider>,
    );
    expect(buyerHtml).toContain("mb-glow-card");
  });

  it("defines Space Grotesk numeric treatment with tabular numbers in globals.css", () => {
    const globalsCss = readFileSync(
      new URL("../src/app/globals.css", import.meta.url),
      "utf8",
    );

    expect(globalsCss).toContain(".mb-num-display,");
    expect(globalsCss).toContain("font-family: var(--mb-font-display);");
    expect(globalsCss).toContain('font-feature-settings: "tnum";');
  });

  it("mounts HeroNetworkBackground in FitmentSection", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <FitmentSection />
      </LanguageProvider>,
    );

    expect(html).toContain('class="mb-network-bg"');
    expect(html).toContain('class="mb-network-svg"');
  });
});

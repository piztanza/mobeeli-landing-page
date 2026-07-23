import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WhyMobeeli from "@/components/landing/WhyMobeeli";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("R5 Authorized Port #1 — HeroBackground SVG Bezier Network in /why-mobeeli", () => {
  it("renders network background with SVG bezier paths inside WhyMobeeli", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <WhyMobeeli />
      </LanguageProvider>,
    );

    expect(html).toContain('class="mb-network-bg"');
    expect(html).toContain('class="mb-network-svg"');
    expect(html).toContain("M 600 100 C 600 300 200 400 100 700");
  });

  it("defines packetPulse animation and reduced-motion override in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-network-bg {");
    expect(landingCss).toContain("@keyframes packetPulse {");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.mb-packet-anim\s*\{[^}]*animation:\s*none/s,
    );
  });
});

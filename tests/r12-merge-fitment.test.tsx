import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentSection from "@/components/landing/FitmentSection";
import LandingView from "@/components/landing/LandingView";
import { copy } from "@/lib/i18n/copy";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("R12 Merge HowItWorks into Fitment Scanner Section", () => {
  const landingCss = readFileSync(
    new URL("../src/components/landing/landing.css", import.meta.url),
    "utf8",
  );

  it("removes standalone HowItWorks from LandingView main stack", () => {
    const code = readFileSync(
      new URL("../src/components/landing/LandingView.tsx", import.meta.url),
      "utf8",
    );
    expect(code).not.toContain("<HowItWorks");
    expect(code).not.toContain('import HowItWorks from "./HowItWorks";');

    const html = renderToStaticMarkup(<LandingView />);
    expect(html).toContain('id="how-it-works"');
    expect(html).not.toContain("mb-funnel-sim");
  });

  it("asserts FitmentSection does NOT import 3D FitmentWheel (Founder mandate: 2D DOM scanner only)", () => {
    const code = readFileSync(
      new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
      "utf8",
    );
    expect(code).not.toContain("FitmentWheel");
    expect(code).not.toContain('import dynamic from "next/dynamic";\nimport FitmentWheel');
  });

  it("renders 2D DOM Avanza Scanner, 4 spec callout chips, 3 numbered beats (01/02/03), and protection rows in FitmentSection", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <FitmentSection />
      </LanguageProvider>,
    );

    expect(html).toContain('id="how-it-works"');
    expect(html).toContain(copy.en.how_h2);
    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).toContain(">03<");

    // 2D DOM Scanner elements
    expect(html).toContain("mb-scan-car-frame");
    expect(html).toContain("mb-scan-chips");
    expect(html).toContain("Bolt pattern 4×100");
    expect(html).toContain("Rotor ⌀54.1mm");
    expect(html).toContain("Ceramic pad · OEM");
    expect(html).toContain("Authentic");

    // Beat 03 protection rows
    expect(html).toContain(copy.en.prot_r1);
    expect(html).toContain(copy.en.prot_r2);
    expect(html).toContain(copy.en.prot_r3);
    expect(html).toContain("mb-fit-protect");
  });

  it("defines CSS rules for R12 merged fitment & 2D DOM scanner layout in landing.css", () => {
    expect(landingCss).toContain(".mb-h2--fit3d");
    expect(landingCss).toContain(".mb-step-badge-row");
    expect(landingCss).toContain(".mb-scan-car-frame");
    expect(landingCss).toContain(".mb-scan-chips");
    expect(landingCss).toContain(".mb-fit-protect");
    expect(landingCss).toContain(".mb-step-stack--row");
  });
});

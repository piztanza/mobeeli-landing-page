import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentSection from "@/components/landing/FitmentSection";
import Hero from "@/components/landing/Hero";
import { copy } from "@/lib/i18n";

describe("R5 Iteration 1 — Fitment Stage Framing (audited)", () => {
  it("renders the keyed, honest stage chip and backlight glow in FitmentSection", () => {
    const html = renderToStaticMarkup(<FitmentSection />);
    expect(html).toContain('class="mb-fit3d-telemetry"');
    // Audit ruling: the chip is an i18n key and an HONEST label — no fake
    // real-time-telemetry claims on marketing surfaces.
    expect(html).toContain(copy.en.fit3d_chip);
    expect(html).not.toContain("REAL-TIME");
    expect(html).toContain('class="mb-fit3d-stage-glow"');
    // The spotlight class was removed in audit round 3 — never reference it.
    expect(html).not.toContain("mb-card-dark-spotlight");
  });

  it("hero CTAs carry ONLY the magnetic treatment — no effect stacking", () => {
    const html = renderToStaticMarkup(<Hero />);
    // Audit ruling: HoverArrow was removed (twice shipped consumer-less /
    // misapplied); the magnetic transform owns the hero CTAs.
    expect(html).not.toContain("mb-link-arrow");
  });

  it("defines CSS for telemetry chip, glow, and the real glass bezel", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-fit3d-telemetry {");
    expect(landingCss).toContain(".mb-fit3d-stage-glow {");
    expect(landingCss).toContain("radial-gradient(500px 300px at 50% 40%");
    expect(landingCss).toMatch(
      /\.mb-fit3d-stage \.mb-hero-scene \{[^}]*var\(--mb-shadow-linear-4layer\)/s,
    );
    expect(landingCss).not.toContain(".mb-link-arrow");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Proposal R13 — Liquid-Glass 2.0 (Apple Glassmorphism 2026)", () => {
  const landingCss = readFileSync(
    new URL("../src/components/landing/landing.css", import.meta.url),
    "utf8",
  );

  it("defines backdrop-filter blur(22px) saturate(1.5) and -webkit vendor prefix", () => {
    expect(landingCss).toContain("backdrop-filter: blur(22px) saturate(1.5)");
    expect(landingCss).toContain("-webkit-backdrop-filter: blur(22px) saturate(1.5)");
  });

  it("defines the Liquid-Glass specular top-left highlight (inset 1px 1px 0 rgba(255, 255, 255, 0.4))", () => {
    expect(landingCss).toContain("box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.4)");
    expect(landingCss).toContain("border: 1px solid rgba(255, 255, 255, 0.14)");
  });

  it("scopes Liquid-Glass 2.0 rules to the fitment section panels", () => {
    const panels = [
      ".mb-fit3d .mb-ymm-picker",
      ".mb-fit3d .mb-card-part",
      ".mb-fit3d .mb-card-fit",
      ".mb-fit3d .mb-fit3d-telemetry",
      ".mb-fit3d .mb-scan-chip",
      ".mb-fit3d .mb-fit-protect",
      ".mb-fit3d .mb-fit3d-stage",
    ];

    for (const panel of panels) {
      expect(landingCss).toContain(panel);
    }
  });

  it("provides accessibility fallback via prefers-reduced-transparency: reduce", () => {
    expect(landingCss).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-transparency:\s*reduce\)\s*\{[^}]*backdrop-filter:\s*none/s,
    );
  });
});

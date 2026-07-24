import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { NAV_DESKTOP_QUERY } from "@/components/landing/Nav";
import { copy } from "@/lib/i18n/copy";

describe("R10 Immersion Specification Contracts (R10-A through R10-H)", () => {
  const landingCss = readFileSync(
    new URL("../src/components/landing/landing.css", import.meta.url),
    "utf8",
  );

  it("R10-A: creates and mounts AmbientAurora across Hero, FitmentSection, and AiCatalogCard", () => {
    const code = readFileSync(
      new URL("../src/components/three/AmbientAurora.tsx", import.meta.url),
      "utf8",
    );
    expect(code).toContain("import(");
    expect(code).toContain("three");
    expect(code).toContain("uBaseIntensity");
    expect(code).toContain("uVelocity");
    expect(code).toContain("uProgress");
    expect(code).toContain("preserveDrawingBuffer: true");
    expect(code).toContain("AdditiveBlending");

    expect(landingCss).toMatch(/\.mb-ambient-aurora\s*\{[^}]*position:\s*absolute;/s);

    const heroCode = readFileSync(
      new URL("../src/components/landing/Hero.tsx", import.meta.url),
      "utf8",
    );
    expect(heroCode).toContain("AmbientAurora");
    expect(heroCode).toContain("intensity={0.4}");

    const fitmentCode = readFileSync(
      new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
      "utf8",
    );
    expect(fitmentCode).toContain("AmbientAurora");
    expect(fitmentCode).toContain("intensity={0.3}");

    const aiCode = readFileSync(
      new URL("../src/components/landing/AiCatalogCard.tsx", import.meta.url),
      "utf8",
    );
    expect(aiCode).toContain("AmbientAurora");
    expect(aiCode).toContain("intensity={0.28}");
  });

  it("R10-B: updates H1 scale/weight and unifies H2 heads at 600 for clear hierarchy", () => {
    expect(landingCss).toContain("clamp(2.75rem, 6.6vw, 5.25rem)");
    expect(landingCss).toContain("clamp(38px, 4.8vw, 64px)");
    expect(landingCss).toContain("clamp(42px, 5.4vw, 74px)");
    expect(landingCss).toContain("clamp(32px, 3.8vw, 50px)");
    expect(landingCss).toMatch(/\.mb-h2\s*\{[^}]*font-weight:\s*600;/);
    expect(landingCss).toMatch(/\.mb-cat-h2\s*\{[^}]*font-weight:\s*600;/);
    expect(landingCss).toMatch(/\.mb-uni-h2\s*\{[^}]*font-weight:\s*600;/);
  });

  it("R10-C: applies rotating line-2 gradient with @supports fallback in landing.css", () => {
    expect(landingCss).toContain("@supports ((-webkit-background-clip: text) or (background-clip: text))");
    expect(landingCss).toContain("linear-gradient(92deg, var(--mb-light-accent)");
    expect(landingCss).toContain("background-clip: text");
  });

  it("R10-D: applies fitment stage flanking rail overlap at >=1200px in landing.css", () => {
    expect(landingCss).toContain("margin-right: -36px");
    expect(landingCss).toContain("margin-left: -36px");
  });

  it("R10-E: updates camera position and fog for Java corridor framing in IndoGlobe.tsx", () => {
    const globeCode = readFileSync(
      new URL("../src/components/three/IndoGlobe.tsx", import.meta.url),
      "utf8",
    );
    expect(globeCode).toContain("camera.position.set(camX + drift, 5.0, 3.9 + camZ)");
    expect(globeCode).toContain("scene.fog = new THREE.Fog(0x0d1522, 8.0, 15.2)");
  });

  it("R10-F: updates nav desktop collapse breakpoint to 1040px", () => {
    expect(NAV_DESKTOP_QUERY).toBe("(min-width: 1040px)");
    expect(landingCss).toContain("@media (max-width: 1039.98px)");
    expect(landingCss).toContain("@media (min-width: 1040px)");
  });

  it("R10-G: caps step titles font weight at 700 in landing.css", () => {
    const stepRule = landingCss.match(/\.mb-step-t \{[^}]*\}/s)?.[0] ?? "";
    expect(stepRule).toContain("font-weight: 700;");
  });

  it("R10-H: rewrites hero_sub_short in EN and ID to remove line duplication", () => {
    expect(copy.en.hero_sub_short).toBe(
      "Brands, distributors, stores, mechanics and drivers — one verified catalog for Indonesia's auto industry.",
    );
    expect(copy.id.hero_sub_short).toBe(
      "Merek, distributor, toko, mekanik, dan pengemudi — satu katalog terverifikasi untuk industri otomotif Indonesia.",
    );
  });
});

import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { AURORA_INTENSITY } from "@/components/three/auroraIntensity";

/**
 * R16 design decision 2 — one aurora intensity.
 *
 * The mounts used to differ (hero 0.4, fitment 0.3, catalog 0.28). With the
 * catalog demo unmounted, the two survivors sat 8% apart in adjacent dark
 * bands — close enough to read as an accident rather than a decision.
 *
 * The guard that matters is the LAST one: a literal is how the third value crept
 * in the first time, so no `intensity={0.n}` may exist anywhere.
 */

const landingDir = new URL("../src/components/landing/", import.meta.url);
const componentSources = readdirSync(landingDir)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => ({ file: f, src: readFileSync(new URL(f, landingDir), "utf8") }));

describe("one aurora intensity, referenced by name", () => {
  it("is the agreed 0.35", () => {
    expect(AURORA_INTENSITY).toBe(0.35);
  });

  it("passes a numeric literal to `intensity` nowhere in the landing components", () => {
    for (const { file, src } of componentSources) {
      expect(src, `${file} passes a literal intensity`).not.toMatch(/intensity=\{\s*0?\.\d+\s*\}/);
    }
  });

  it("routes every aurora mount through the constant", () => {
    const mounts = componentSources.filter(({ src }) => src.includes("<AmbientAurora"));
    expect(mounts.length, "components mounting AmbientAurora").toBeGreaterThan(0);
    for (const { file, src } of mounts) {
      expect(src, `${file} intensity prop`).toContain("intensity={AURORA_INTENSITY}");
      expect(src, `${file} imports the constant`).toContain(
        'from "@/components/three/auroraIntensity"',
      );
    }
  });

  it("keeps the constant in its own module so the three.js island stays code-split", () => {
    // A static import of AmbientAurora.tsx purely to read a number would pull
    // its GLSL shader source into the initial chunk, defeating dynamic(ssr:false).
    for (const { file, src } of componentSources) {
      expect(src, `${file} must not statically import the aurora component`).not.toMatch(
        /import\s*\{[^}]*\}\s*from\s*"@\/components\/three\/AmbientAurora"/,
      );
    }
  });
});

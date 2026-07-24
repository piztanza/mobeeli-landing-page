import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Proposal Q5 — Typography Display Math", () => {
  it("sets base heading font-weight to 600 in globals.css", () => {
    const globalsCss = readFileSync(
      new URL("../src/app/globals.css", import.meta.url),
      "utf8",
    );

    expect(globalsCss).toMatch(
      /h1,\s*h2,\s*h3\s*\{[^}]*font-weight:\s*600;/,
    );
  });

  it("configures H1 clamp(2.75rem, 6.6vw, 5.25rem), line-height 1.02, -0.025em letter-spacing in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain("clamp(2.75rem, 6.6vw, 5.25rem)");
    expect(landingCss).toContain("line-height: 1.02;");
    expect(landingCss).toContain("letter-spacing: -0.025em;");
    expect(landingCss).toMatch(/\.mb-h2\s*\{[^}]*font-weight:\s*600;/);
  });
});

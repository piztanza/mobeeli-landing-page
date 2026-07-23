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

  it("configures H1 clamp(2.5rem, 6vw, 4.5rem), line-height 1.04, -0.022em letter-spacing in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    // Audit: min is 2.625rem (42px), not the spec's 2.5rem — the founder's
    // type-scale bump must not regress on phones.
    expect(landingCss).toContain("clamp(2.625rem, 6vw, 4.5rem)");
    expect(landingCss).toContain("line-height: 1.04;");
    expect(landingCss).toContain("letter-spacing: -0.022em;");
    expect(landingCss).toMatch(/\.mb-h2\s*\{[^}]*font-weight:\s*600;/);
  });
});

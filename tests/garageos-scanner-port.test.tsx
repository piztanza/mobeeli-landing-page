import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HowItWorks from "@/components/landing/HowItWorks";
import { t } from "@/lib/i18n";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("R5 Authorized Port #3 — GarageOS Laser Scanner in HowItWorks Step 3", () => {
  it("renders laser scanner box, laser element, and verified authentic badge in HowItWorks", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider lang="en">
        <HowItWorks />
      </LanguageProvider>,
    );

    expect(html).toContain('class="mb-scanner-box"');
    expect(html).toContain('class="mb-scanner-laser"');
    expect(html).toContain('class="mb-verified-badge"');
    expect(html).toContain(t("en", "how_s3_scanner_align"));
    // Audit ruling: no fabricated guarantees — badge states the scan outcome only.
    expect(t("en", "how_s3_scanner_verified")).not.toMatch(/guarantee/i);
    expect(html).toContain(t("en", "how_s3_scanner_verified"));
  });

  it("the scanner ADDS to the approved protection rows — never replaces them", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider lang="en">
        <HowItWorks />
      </LanguageProvider>,
    );
    for (const key of ["prot_r1", "prot_r2", "prot_r3"] as const) {
      expect(html).toContain(t("en", key));
    }
  });

  it("renders Indonesian copy in ID mode via t()", () => {
    expect(t("id", "how_s3_scanner_align")).toBe("MEMINDAI EMBOSS PART · COCOK 2NR-VE");
    expect(t("id", "how_s3_scanner_verified")).toBe("TERVERIFIKASI OTENTIK");
  });

  it("defines laserSweep animation and reduced-motion override in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-scanner-laser {");
    expect(landingCss).toContain("@keyframes laserSweep {");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.mb-scanner-laser\s*\{[^}]*animation:\s*none/s,
    );
  });
});

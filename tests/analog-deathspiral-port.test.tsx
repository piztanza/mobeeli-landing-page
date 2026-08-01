import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WhyMobeeli from "@/components/landing/WhyMobeeli";
import { t } from "@/lib/i18n";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("R5 Authorized Port #2 — AnalogDeathSpiral Problem Cards in /why-mobeeli", () => {
  it("renders AnalogDeathSpiral grid with 3 problem cards inside WhyMobeeli", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider lang="en">
        <WhyMobeeli />
      </LanguageProvider>,
    );

    expect(html).toContain('class="mb-deathspiral-grid"');
    expect(html).toContain(t("en", "why_ds_c1_t"));
    expect(html).toContain(t("en", "why_ds_c2_t"));
    expect(html).toContain(t("en", "why_ds_c3_t"));
    // Audit rulings: every mockup label is keyed; no real manufacturer names
    // on marketing surfaces; no emoji (CLAUDE.md).
    expect(html).toContain(t("en", "why_ds_n_base"));
    expect(html).not.toContain("Astra");
    expect(html).not.toContain("Denso");
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it("translates problem card titles into Indonesian in ID mode via t()", () => {
    expect(t("id", "why_ds_c1_t")).toBe("Efek Domino Margin");
    // ID COPY PASS 2026-08-01: "Injeksi" → "Banjir". On an auto-parts page
    // "injeksi" reads first as fuel injection (mesin injeksi, motor injeksi),
    // so the domain collided with the figure of speech. "Banjir" (flood)
    // carries the same volume sense without the collision.
    expect(t("id", "why_ds_c2_t")).toBe("Banjir Suku Cadang KW");
    expect(t("id", "why_ds_c3_t")).toBe("Belenggu COD");
  });

  it("defines CSS rules for AnalogDeathSpiral grid and cards in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-deathspiral-grid {");
    expect(landingCss).toContain(".mb-ds-card {");
    expect(landingCss).toContain(".mb-ds-glitch-stage {");
  });
});

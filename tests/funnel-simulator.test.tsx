import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HowItWorks from "@/components/landing/HowItWorks";
import { copy, langs } from "@/lib/i18n";

describe("Hypothesis 1 — Search-Funnel Narrowing Simulator in Step 2", () => {
  const html = renderToStaticMarkup(<HowItWorks />);

  it("renders the .mb-funnel-sim container inside Step 2 card", () => {
    expect(html).toContain('class="mb-funnel-sim"');
    expect(html).toContain('class="mb-funnel-input"');
    expect(html).toContain('class="mb-funnel-chip"');
    expect(html).toContain('class="mb-funnel-results"');
  });

  it("has all required i18n keys for the funnel simulator in EN and ID", () => {
    const keys = [
      "how_s2_fnl_q1",
      "how_s2_fnl_q2",
      "how_s2_fnl_q3",
      "how_s2_fnl_c1",
      "how_s2_fnl_c2",
      "how_s2_fnl_c3",
      "how_s2_fnl_badge",
      "how_s2_fnl_unit",
    ];

    for (const lang of langs) {
      const map = copy[lang] as Record<string, string>;
      for (const key of keys) {
        expect(map[key], `${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it("defines CSS rules for .mb-funnel-sim and reduced-motion reset in landing.css", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );

    expect(landingCss).toContain(".mb-funnel-sim {");
    expect(landingCss).toContain(".mb-funnel-chip.is-active {");
    expect(landingCss).toContain(".mb-funnel-badge {");
    expect(landingCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.mb-funnel-cursor\s*\{[^}]*animation:\s*none;/,
    );
  });

  it("keeps the success state in the blue family — no platform emerald leaks (audit contract)", () => {
    const landingCss = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );
    const funnelBlock = landingCss.slice(landingCss.indexOf(".mb-funnel-sim {"));
    const funnelCss = funnelBlock.slice(0, funnelBlock.indexOf(".mb-prot-row"));
    // The platform repo's emerald/indigo tokens are banned on the landing.
    expect(funnelCss).not.toMatch(/#10b981|#34d399|#818cf8|16,\s*185,\s*129/i);
    expect(funnelCss).toMatch(/\.mb-funnel-num\.is-exact \{[^}]*var\(--mb-light-accent\);/s);
  });

  it("renders the unit label from the i18n maps via its own dark-surface class", () => {
    const unit = html.match(/<span class="mb-funnel-unit">[^<]*<\/span>/)?.[0] ?? "";
    expect(unit).toContain(`>${copy.en.how_s2_fnl_unit}<`);
    // The hero-card class must not be reused on the dark funnel panel.
    expect(html).not.toContain('class="mb-card-part-sub">listings');
  });
});

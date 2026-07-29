import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TeamSection from "@/components/landing/TeamSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { t } from "@/lib/i18n";

/**
 * R29 "Ledger stack" (CD handoff 2026-07-29, founder-picked option 2a)
 * replaced the 3-card grid this file used to pin. What it pins now is the
 * R29 contract — the brief's starred QA items plus the invariants that
 * survived from F-013 (every photo carries a real name alt).
 */
const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

describe("R29 /team ledger stack", () => {
  const html = renderToStaticMarkup(
    <LanguageProvider>
      <TeamSection />
    </LanguageProvider>,
  );

  it("renders all three founder headshots with name-and-role alts (matheau replaces yavet)", () => {
    expect(html).toContain("matheau.jpg");
    expect(html).not.toContain("yavet.jpg");
    expect(html).toContain("salman.jpg");
    expect(html).toContain("ferdinansyah.jpg");
    expect(html.match(/<img/g)?.length).toBe(3);
    for (const [n, r] of [
      ["team_n1", "team_r1"],
      ["team_n2", "team_r2"],
      ["team_n3", "team_r3"],
    ] as const) {
      // SSR escapes & to &amp; inside the attribute.
      expect(html, n).toContain(`alt="${t("en", n)} — ${t("en", r).replace(/&/g, "&amp;")}"`);
    }
  });

  it("★ heading and CEO name carry the R29 rulings in both locales", () => {
    // Founder 2026-07-29: engine metaphor rejected; CEO renders as
    // "Matheau Widjaja" everywhere (name keys identical across locales).
    expect(t("en", "team_h2")).toBe("Meet the team.");
    expect(t("en", "team_n1")).toBe("Matheau Widjaja");
    expect(t("id", "team_n1")).toBe("Matheau Widjaja");
    expect(html).not.toContain("Yavet");
    expect(html).not.toContain("One engine");
  });

  it("★ the CEO badge is an INERT span — founder ruling, do not 'fix' into a link", () => {
    // FOUNDER RULING 2026-07-29 (R29 §0.4): his LinkedIn profile is broken,
    // so the badge renders as <span aria-hidden> with the same hover fill —
    // a conscious override of the R6 dead-link rule. TODO: becomes a real
    // <a> when the profile is fixed. Exactly two real anchors (CTO + COO).
    expect(html).toContain('<span class="mb-team2-li" aria-hidden="true">');
    expect(html.match(/class="mb-team2-li"/g)?.length).toBe(3);
    expect(html.match(/<a[^>]*mb-team2-li/g)?.length).toBe(2);
    expect(html).toContain("linkedin.com/in/msalmanalhafizh");
    expect(html).toContain("linkedin.com/in/ferdinansyah-h-864134157");
    // The inert badge must never ship as a dead anchor.
    expect(html).not.toContain('href="#"');
  });

  it("★ portraits are monochrome at rest, colour on hover, motion-gated (CSS contract)", () => {
    expect(landingCss).toMatch(
      /\.mb-team2-plate img \{[^}]*filter: grayscale\(1\) contrast\(1\.06\);[^}]*transition: filter 0\.35s ease;/s,
    );
    expect(landingCss).toMatch(/\.mb-team2-row:hover \.mb-team2-plate img \{[^}]*filter: none;/s);
    // Reduced motion keeps the grayscale<->colour swap but drops the transition.
    expect(landingCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.mb-team2-plate img \{[^}]*transition: none;/s,
    );
  });

  it("ledger anatomy: alternation, ghost numerals behind text, 44px touch targets", () => {
    expect(html.match(/mb-team2-row--flip/g)?.length).toBe(1); // row 2 only — L/R/L alternation
    expect(landingCss).toMatch(/\.mb-team2-row--flip \{[^}]*minmax\(0, 1fr\) 440px;/s);
    expect(landingCss).toMatch(/\.mb-team2-ghost \{[^}]*pointer-events: none;/s);
    expect(landingCss).toMatch(/\.mb-team2-li::after \{[^}]*inset: -9px;/s); // 26 + 2*9 = 44
    expect(landingCss).toMatch(/\.mb-team2-ghost \{\s*[^}]*position: absolute;/s);
    expect(landingCss).toMatch(/@media \(max-width: 979\.98px\) \{[\s\S]*?\.mb-team2-ghost \{\s*display: none;/);
  });

  it("closes on the stamped traction line, verbatim", () => {
    expect(t("en", "team_quote")).toBe("Most of the shops we visited signed the same afternoon.");
    expect(html).toContain(t("en", "team_quote_by"));
  });
});

import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TeamSection from "@/components/landing/TeamSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { t } from "@/lib/i18n";

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

describe("team headshots (F-013, CHG-piztanza-10)", () => {
  const html = renderToStaticMarkup(
    <LanguageProvider>
      <TeamSection />
    </LanguageProvider>,
  );

  it("renders all three founder headshots with full-name alts", () => {
    expect(html).toContain("yavet.jpg");
    expect(html).toContain("salman.jpg");
    expect(html).toContain("ferdinansyah.jpg");
    for (const key of ["team_n1", "team_n2", "team_n3"] as const) {
      expect(html, key).toContain(`alt="${t("en", key)}"`);
    }
  });

  it("no founder is left on the decorative gradient placeholder", () => {
    // This test used to assert the OPPOSITE — that Yavet stayed on the gradient
    // and the section held exactly two images — because no photo had been
    // supplied. The founder supplied one on 2026-07-28. The invariant worth
    // keeping is not the count but the rule: a card either carries a real
    // headshot WITH a name alt, or a decorative placeholder marked aria-hidden.
    // Never a photo without an alt.
    expect(html.match(/<img/g)?.length).toBe(3);
    for (const cls of ["mb-team-photo--a", "mb-team-photo--b", "mb-team-photo--c"]) {
      const wrap = html.match(new RegExp(`<div[^>]*${cls}[^>]*>`))?.[0] ?? "";
      expect(wrap, `${cls} carries a photo, so it must not be aria-hidden`).not.toContain(
        "aria-hidden",
      );
    }
  });

  it("slots headshots into the 1:1 area — cover fit, top position (CSS contract)", () => {
    expect(landingCss).toMatch(
      /\.mb-team-photo \{[^}]*aspect-ratio: 1\/1;[^}]*position: relative;[^}]*overflow: hidden;/s,
    );
    expect(landingCss).toMatch(
      /\.mb-team-photo img \{[^}]*object-fit: cover;[^}]*object-position: top;/s,
    );
  });

  it("keeps all three founder cards with the gradient classes intact", () => {
    for (const cls of ["mb-team-photo--a", "mb-team-photo--b", "mb-team-photo--c"]) {
      expect(html).toContain(cls);
    }
    for (const key of ["team_n1", "team_n2", "team_n3"] as const) {
      expect(html).toContain(t("en", key));
    }
  });
});

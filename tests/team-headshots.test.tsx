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

  it("renders the Salman and Ferdinansyah headshots with full-name alts", () => {
    expect(html).toContain("salman.jpg");
    expect(html).toContain("ferdinansyah.jpg");
    expect(html).toContain(`alt="${t("en", "team_n2")}"`);
    expect(html).toContain(`alt="${t("en", "team_n3")}"`);
  });

  it("keeps Yavet on the gradient placeholder — exactly two images in the section", () => {
    expect(html.match(/<img/g)?.length).toBe(2);
    expect(html).toContain("mb-team-photo--a");
    // Yavet's placeholder stays decorative
    const yavet = html.match(/<div[^>]*mb-team-photo--a[^>]*>/)?.[0] ?? "";
    expect(yavet).toContain("aria-hidden");
    expect(html).not.toContain(`alt="${t("en", "team_n1")}"`);
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

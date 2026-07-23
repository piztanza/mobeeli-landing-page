import { readFileSync } from "node:fs";

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import EarlyAdoptersPage from "@/app/early-adopters/page";
import InvestorsPage from "@/app/investors/page";
import JoinPage from "@/app/join/page";
import LandingPage from "@/app/page";
import TeamPage from "@/app/team/page";
import WhyMobeeliPage from "@/app/why-mobeeli/page";
import { t } from "@/lib/i18n";

const globalsCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
const joinCss = readFileSync(new URL("../src/components/join/join.css", import.meta.url), "utf8");

/** Every public page view — each must lead with the skip link (a11y pass). */
const PAGES: readonly { path: string; Page: () => ReactElement }[] = [
  { path: "/", Page: LandingPage },
  { path: "/join", Page: JoinPage },
  { path: "/team", Page: TeamPage },
  { path: "/early-adopters", Page: EarlyAdoptersPage },
  { path: "/investors", Page: InvestorsPage },
  { path: "/why-mobeeli", Page: WhyMobeeliPage },
];

describe("skip-to-content link", () => {
  for (const { path, Page } of PAGES) {
    it(`${path} renders the skip link first, wired to the main landmark`, () => {
      const html = renderToStaticMarkup(<Page />);

      const skip = html.match(/<a[^>]*mb-skip-link[^>]*>/)?.[0] ?? "";
      expect(skip).toContain('href="#main-content"');
      expect(html).toContain(`>${t("en", "skip_to_content")}</a>`);

      const main = html.match(/<main[^>]*>/)?.[0] ?? "";
      expect(main).toContain('id="main-content"');
      expect(main).toContain('tabindex="-1"');

      // First focusable: the skip link precedes the nav (when present) and main.
      const skipAt = html.indexOf("mb-skip-link");
      expect(skipAt).toBeGreaterThan(-1);
      const navAt = html.indexOf("<nav");
      if (navAt !== -1) expect(skipAt).toBeLessThan(navAt);
      expect(skipAt).toBeLessThan(html.indexOf("<main"));
    });
  }

  it("globals.css hides the skip link off-viewport and reveals it on focus", () => {
    expect(globalsCss).toMatch(/\.mb-skip-link \{[^}]*position: fixed;/s);
    expect(globalsCss).toMatch(/\.mb-skip-link \{[^}]*transform: translateY\(/s);
    expect(globalsCss).toMatch(/\.mb-skip-link:focus \{[^}]*transform: none;/s);
  });

  it("landing.css keeps the pill text white against its color:inherit link reset", () => {
    // .mb-landing a (0,1,1) would beat .mb-skip-link (0,1,0) — the scoped
    // override must exist or the pill fails AA contrast on landing pages.
    expect(landingCss).toMatch(/\.mb-landing a\.mb-skip-link \{[^}]*color: #fff;/s);
  });
});

describe("focus-visible system (CSS contract)", () => {
  it("globals.css defines the ring token and the global :focus-visible outline", () => {
    expect(globalsCss).toMatch(/--mb-focus-ring: var\(--mb-primary\);/);
    expect(globalsCss).toMatch(/:focus-visible \{[^}]*outline: 2px solid var\(--mb-focus-ring\);/s);
    expect(globalsCss).toMatch(/:focus-visible \{[^}]*outline-offset: 2px;/s);
  });

  it("the skip target never shows a ring and clears the sticky nav on every page", () => {
    expect(globalsCss).toMatch(/#main-content \{[^}]*outline: none;/s);
    // /join's main sits outside .mb-landing, so the 84px offset must live here.
    expect(globalsCss).toMatch(/#main-content \{[^}]*scroll-margin-top: 84px;/s);
  });

  it("no input suppresses the focus outline anymore", () => {
    expect(landingCss).not.toMatch(/\.mb-buyer-input \{[^}]*outline: none/s);
    expect(landingCss).not.toMatch(/\.mb-deckform-input \{[^}]*outline: none/s);
    expect(joinCss).not.toMatch(/\.mb-jw-input \{[^}]*outline: none/s);
  });
});

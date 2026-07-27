import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import JoinPage from "@/app/join/page";
import LandingPage from "@/app/page";
import TeamPage from "@/app/team/page";
import Nav from "@/components/landing/Nav";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

/** The overlay-variant CSS section, fenced by its banner comment. */
const overlayBlock =
  landingCss.match(/\/\* -+ nav overlay variant[\s\S]*?(?=\/\* -+ mobile nav)/)?.[0] ?? "";

describe("nav overlay variant (landing only)", () => {
  it("<Nav overlay /> renders the overlay class, SSR-transparent, with both logos", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Nav overlay />
      </LanguageProvider>,
    );
    const nav = html.match(/<nav[^>]*>/)?.[0] ?? "";
    expect(nav).toContain("mb-nav--overlay");
    // SSR = at-rest state at scrollY 0 = transparent.
    expect(nav).not.toContain("is-solid");

    const logo = html.match(/<a[^>]*mb-nav-logo[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
    expect(logo).toContain("mobeeli-logo-blue.png");
    expect(logo).toContain("mobeeli-logo-white.png");
    // a11y fix (R6): BOTH logo variants carry the accessible name and neither
    // is aria-hidden — only one is ever in the a11y tree (the other is
    // display:none), so the home link is always named, including the
    // transparent overlay state where the white variant is visible.
    const whiteImg = logo.match(/<img[^>]*mb-nav-logo-white[^>]*>/)?.[0] ?? "";
    expect(whiteImg).not.toContain("aria-hidden");
    expect(whiteImg).toContain('alt="Mobeeli"');
    const blueImg = logo.match(/<img[^>]*mb-nav-logo-blue[^>]*>/)?.[0] ?? "";
    expect(blueImg).toContain('alt="Mobeeli"');
  });

  it("<Nav /> stays the solid default", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Nav />
      </LanguageProvider>,
    );
    expect(html).not.toContain("mb-nav--overlay");
  });

  it("only the landing page opts into the overlay", () => {
    expect(renderToStaticMarkup(<LandingPage />)).toContain("mb-nav--overlay");
    expect(renderToStaticMarkup(<TeamPage />)).not.toContain("mb-nav--overlay");
    expect(renderToStaticMarkup(<JoinPage />)).not.toContain("mb-nav--overlay");
  });
});

describe("nav overlay + hero viewport (CSS contracts)", () => {
  it("overlay bar is fixed and fully transparent until solid", () => {
    expect(overlayBlock).toMatch(/\.mb-nav--overlay \{[^}]*position: fixed;/s);
    expect(overlayBlock).toMatch(/\.mb-nav--overlay:not\(\.is-solid\) \{[^}]*background: transparent;/s);
    expect(overlayBlock).toMatch(
      /\.mb-nav--overlay:not\(\.is-solid\) \{[^}]*border-bottom-color: transparent;/s,
    );
  });

  it("transparent state recolors logo, links, toggle, CTA and burger for the dark hero", () => {
    expect(overlayBlock).toMatch(/\.mb-nav-logo-blue \{[^}]*display: none;/s);
    expect(overlayBlock).toMatch(/\.mb-nav-logo-white \{[^}]*display: block;/s);
    expect(overlayBlock).toMatch(/\.mb-nav-links a \{[^}]*color: rgba\(255, 255, 255, 0\.88\);/s);
    expect(overlayBlock).toMatch(/\.mb-lang-btn\.is-active \{[^}]*background: #fff;/s);
    // R25 change A: the overlay CTA moved to the AA-compliant fill. White on
    // --mb-primary is 3.90:1; --mb-primary-cta resolves to --mb-deep-blue at
    // 5.70:1. The white here is inherited from .mb-nav-cta and .mb-landing
    // .mb-nav-cta, so no same-block grep — including the contract test in
    // tests/cta-contrast.test.ts — can see this rule. This assertion is the
    // only thing guarding it.
    expect(overlayBlock).toMatch(/\.mb-nav-cta \{[^}]*background: var\(--mb-primary-cta\);/s);
    expect(overlayBlock).toMatch(/\.mb-nav-burger-bar \{[^}]*background: #fff;/s);
  });

  it("the solid transition is gated behind no-preference and never touches outlines", () => {
    expect(overlayBlock).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*\.mb-nav--overlay \{\s*transition:/,
    );
    // The a11y focus-ring contract: the overlay variant must not restyle outlines.
    expect(overlayBlock).not.toContain("outline");
  });

  it("hero fills the first viewport under the 66px fixed bar", () => {
    const hero = landingCss.match(/\.mb-hero \{[^}]*\}/s)?.[0] ?? "";
    // Fallback order matters: vh first, svh wins where supported.
    expect(hero).toMatch(/min-height: 100vh;[\s\S]*min-height: 100svh;/);
    expect(hero).toContain("align-items: center;");
    expect(hero).toMatch(/padding: calc\(66px \+ 40px\)/);
  });

  it("logo visibility is per-variant, never on the shared img rule (double-logo regression, R6)", () => {
    // The bug: `.mb-nav-logo img { display: block }` (0,1,1) out-specified
    // `.mb-nav-logo-white { display: none }` (0,1,0), showing BOTH logos on the
    // solid/light nav. The shared img rule must carry sizing only.
    const imgRule = landingCss.match(/\.mb-nav-logo img \{[^}]*\}/s)?.[0] ?? "";
    expect(imgRule).not.toContain("display:");
    expect(imgRule).toContain("height: 42px;"); // enlarged from 34px (founder)
    expect(landingCss).toMatch(/\.mb-nav-logo-blue \{[^}]*display: block;/s);
    expect(landingCss).toMatch(/\.mb-nav-logo-white \{[^}]*display: none;/s);
  });
});

describe("hero background media (visual-polish iteration 1 + audit fix)", () => {
  it("ships the decorative background video with poster, inert and deferred", () => {
    const html = renderToStaticMarkup(<LandingPage />);
    const media = html.match(/<div[^>]*mb-hero-bg-media[^>]*>[\s\S]*?<\/video>/)?.[0] ?? "";
    expect(media).toContain('aria-hidden="true"');
    const video = media.match(/<video[^>]*>/)?.[0] ?? "";
    expect(video).toContain("/veo/jakarta-hero-bg.mp4");
    expect(video).toContain('poster="/veo/jakarta-hero-bg-poster.jpg"');
    expect(video).toContain('preload="none"');
    expect(video).toContain("muted");
    expect(video.toLowerCase()).toContain("playsinline");
  });

  it("keeps the media layer inert and below the content grid (CSS contract)", () => {
    expect(landingCss).toMatch(/\.mb-hero-bg-media \{[^}]*pointer-events: none;/s);
    expect(landingCss).toMatch(/\.mb-hero-bg-media \{[^}]*z-index: 0;/s);
    expect(landingCss).toMatch(/\.mb-hero-grid \{[^}]*z-index: 1;/s);
  });

  it("grades the near-white clip and buys hero text contrast LOCALLY (CSS contract)", () => {
    // R25 change B replaced the audit-era approach. The clip is still graded —
    // it is near-white source and the hero must stay a dark surface — but the
    // grade is lighter (0.45 -> 0.62, opacity 0.3 -> 0.5) and the flat
    // rgba(13,21,34,0.35) veil that used to darken the entire band is gone.
    // Compounded, those three took the photograph to roughly a tenth of its
    // real luminance.
    //
    // Contrast is now bought by .mb-hero-scrim, an ellipse over the text column
    // only. Measured composited on the live page, identical at 1280 and 390:
    // chip 11.5:1, subhead 8.6:1 (10.6 and 7.9 at the scrim's 46% stop). Those
    // two are lighter than white and so were the binding constraint, not the H1.
    expect(landingCss).toMatch(
      /\.mb-hero-bg-media video,\s*\.mb-hero-bg-media img \{[^}]*filter: brightness\(0\.62\)/s,
    );
    // The veil must NOT come back — re-adding it is the regression this guards.
    expect(landingCss).not.toMatch(
      /\.mb-hero-bg-scrim \{[^}]*linear-gradient\(rgba\(13, 21, 34, 0\.35\), rgba\(13, 21, 34, 0\.35\)\)/s,
    );
    // The top gradient stays: it protects the overlay nav, which does span the
    // full width, so that one is not a text-column concern.
    expect(landingCss).toMatch(
      /\.mb-hero-bg-scrim \{[^}]*linear-gradient\(rgba\(13, 21, 34, 0\.4\), transparent 120px\)/s,
    );
    // The local scrim must exist and must be a radial — a rectangle would show
    // a hard edge over the photograph.
    expect(landingCss).toMatch(/\.mb-hero-scrim \{[^}]*background: radial-gradient\(/s);
  });

  it("dots the buyer strip with the engineering grid (CSS contract)", () => {
    expect(landingCss).toMatch(
      /\.mb-buyer \{[^}]*radial-gradient\(rgba\(91, 155, 247, 0\.1\) 1\.2px, transparent 1\.2px\);/s,
    );
  });
});

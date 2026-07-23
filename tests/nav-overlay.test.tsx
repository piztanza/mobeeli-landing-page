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
    const whiteImg = logo.match(/<img[^>]*mb-nav-logo-white[^>]*>/)?.[0] ?? "";
    expect(whiteImg).toContain('aria-hidden="true"');
    expect(whiteImg).toContain('alt=""');
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
    expect(overlayBlock).toMatch(/\.mb-nav-cta \{[^}]*background: var\(--mb-primary\);/s);
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

  it("grades the near-white clip dark so hero text keeps AA contrast (CSS contract)", () => {
    // Audit fix: brightness-graded video + a flat ink veil in the scrim.
    expect(landingCss).toMatch(
      /\.mb-hero-bg-media video,\s*\.mb-hero-bg-media img \{[^}]*filter: brightness\(0\.4/s,
    );
    expect(landingCss).toMatch(
      /\.mb-hero-bg-scrim \{[^}]*linear-gradient\(rgba\(13, 21, 34, 0\.35\), rgba\(13, 21, 34, 0\.35\)\)/s,
    );
  });

  it("dots the buyer strip with the engineering grid (CSS contract)", () => {
    expect(landingCss).toMatch(
      /\.mb-buyer \{[^}]*radial-gradient\(rgba\(91, 155, 247, 0\.1\) 1\.2px, transparent 1\.2px\);/s,
    );
  });
});

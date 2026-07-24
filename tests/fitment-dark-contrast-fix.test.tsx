import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentSection from "@/components/landing/FitmentSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

/**
 * Second-section audit fixes: R12 moved the "How it works" content onto the dark
 * .mb-fit3d surface and R13 turned the cards to glass, but the text/asset
 * adaptation was half-done — the H2, the part-card price/sub, and the scanner
 * stage all shipped broken (invisible dark-on-dark / a collapsed 40px frame).
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

describe("dark fitment section — text is legible on the dark/glass surface", () => {
  it("makes the section heading white (was dark ink on dark, 1.0:1)", () => {
    expect(landingCss).toMatch(/\.mb-h2--fit3d \{[^}]*color: #fff;/s);
  });

  it("recolors the glass part-card price to white and the sub to dark-muted", () => {
    // price joins the #ffffff recolor list
    expect(landingCss).toMatch(
      /\.mb-fit3d \.mb-card-part-price,[^{]*\{[^}]*color: #ffffff;/s,
    );
    expect(landingCss).toMatch(
      /\.mb-fit3d \.mb-card-part-sub,[\s\S]*?\.mb-fit3d \.mb-card-video-cap \{[^}]*color: var\(--mb-dark-muted\);/s,
    );
  });
});

describe("scanner stage renders a real frame (not a collapsed sliver)", () => {
  it("gives .mb-fit3d-stage an explicit aspect-ratio so all-absolute children can't collapse it", () => {
    expect(landingCss).toMatch(/\.mb-fit3d-stage \{[^}]*aspect-ratio: 16 \/ 10;/s);
  });
});

describe("beat numbering is 01 / 02 / 03 with no duplicate", () => {
  const html = renderToStaticMarkup(
    <LanguageProvider>
      <FitmentSection />
    </LanguageProvider>,
  );

  it("renders exactly one of each beat number (the stray fit-card 03 is gone)", () => {
    for (const n of [">01<", ">02<", ">03<"]) {
      const count = html.split(n).length - 1;
      expect(count, `${n} occurrences`).toBe(1);
    }
  });
});

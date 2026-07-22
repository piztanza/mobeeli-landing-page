import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BuyerStrip from "@/components/landing/BuyerStrip";
import { langs, t } from "@/lib/i18n";

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

describe("buyer strip notify capture (F-015, CHG-piztanza-13)", () => {
  const html = renderToStaticMarkup(<BuyerStrip />);

  it("ships collapsed: a CTA button in the strip, no mailto, no navigation", () => {
    const cta = html.match(/<button[^>]*mb-buyer-cta[^>]*>/)?.[0] ?? "";
    expect(cta).toContain('type="button"');
    expect(cta).toContain('aria-expanded="false"');
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<input");
  });

  it("has the full bilingual inline copy set (label, placeholder, states)", () => {
    for (const lang of langs) {
      for (const key of [
        "buyer_email_label",
        "buyer_email_ph",
        "buyer_send",
        "buyer_sending",
        "buyer_success",
        "buyer_err_email",
        "buyer_err_fail",
      ] as const) {
        expect(t(lang, key), `${lang}.${key}`).toBeTruthy();
      }
      // Distinct success vs error copy per language.
      expect(t(lang, "buyer_success")).not.toBe(t(lang, "buyer_err_fail"));
    }
  });

  it("expand animation is gated for reduced motion in CSS (instant expand)", () => {
    expect(landingCss).toContain("@keyframes mb-buyer-expand");
    // The hook adds .is-instant; the media query covers the pre-hydration frame.
    expect(landingCss).toMatch(/\.mb-buyer-form\.is-instant\s*\{\s*animation:\s*none/);
    expect(landingCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.mb-buyer-form\s*\{\s*animation:\s*none/,
    );
  });

  it("hides the honeypot field off-screen", () => {
    expect(landingCss).toMatch(/\.mb-buyer-honeypot\s*\{[^}]*left:\s*-9999px/);
  });
});

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * R25 change A. White-on-#2f7df6 is 3.90:1, under the 4.5:1 AA floor; the CTA
 * fill token resolves to #1b5fd9 (5.70:1). This test pins the ratio itself
 * rather than the hex, so a future palette change fails loudly instead of
 * silently reintroducing the defect.
 */
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

const chan = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const tokenValue = (name: string) => {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
};

describe("CTA contrast (R25 change A)", () => {
  it("defines --mb-primary-cta pointing at the deep blue", () => {
    expect(tokenValue("mb-primary-cta")).toBe("var(--mb-deep-blue)");
  });

  it("the deep blue clears AA for white text; the primary does not", () => {
    const deep = tokenValue("mb-deep-blue");
    const prim = tokenValue("mb-primary");
    expect(deep).toMatch(/^#[0-9a-f]{6}$/i);
    expect(prim).toMatch(/^#[0-9a-f]{6}$/i);
    expect(ratio("#ffffff", deep!)).toBeGreaterThanOrEqual(4.5);
    // Documents WHY the swap exists. If someone deepens --mb-primary so that it
    // also passes, this fails and the token can be retired deliberately.
    expect(ratio("#ffffff", prim!)).toBeLessThan(4.5);
  });

  it("no filled button paints white on the raw primary", () => {
    const landing = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );
    // Rules that set BOTH a white color and a primary background.
    const bad = landing
      .split("}")
      .filter(
        (b) =>
          /background:\s*var\(--mb-primary\)/.test(b) &&
          /color:\s*(#fff|#ffffff|white|var\(--mb-on-primary\))/i.test(b),
      );
    expect(bad, `white-on-primary rules:\n${bad.join("\n---\n")}`).toHaveLength(0);
  });

  /**
   * The spec's own third assertion is narrow by its own admission: it only sees
   * rules where the white `color` and the primary `background` sit in one block.
   * Two of the real defects do not — `.mb-nav--overlay:not(.is-solid)
   * .mb-nav-cta` and `.mb-btn-primary-dark` both inherit white from a separate
   * rule. It also never reads deck.css, where four more live.
   *
   * So this enumerates the filled-button family by selector and checks the
   * background each one actually resolves to. Every selector below is asserted
   * to EXIST first — the earlier draft of this test listed `.mb-cta` and
   * `.mb-buyer-btn`, neither of which is in the codebase, and silently skipped
   * them. A test that passes because it found nothing is the failure mode this
   * repo has hit twice.
   */
  it("every filled button — including the inherited-white ones — uses the CTA token", () => {
    const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
    const landing = read("../src/components/landing/landing.css");
    const deck = read("../src/components/deck/deck.css");

    const cases: [string, string, string][] = [
      ["landing.css", landing, ".mb-nav--overlay:not(.is-solid) .mb-nav-cta"],
      ["landing.css", landing, ".mb-nav--overlay:not(.is-solid) .mb-nav-cta:hover"],
      ["landing.css", landing, ".mb-btn-primary-dark"],
      ["landing.css", landing, ".mb-btn-primary-dark:hover"],
      ["landing.css", landing, ".mb-cat-pill"],
      ["landing.css", landing, ".mb-deckform-badge"],
      ["landing.css", landing, ".mb-vin-btn"],
      ["deck.css", deck, ".mb-deck .mb-deck-gate-cta"],
      ["deck.css", deck, ".mb-deck .mb-deck-gate-cta:hover"],
      ["deck.css", deck, ".mb-da-btn"],
      ["deck.css", deck, ".mb-da-btn:hover"],
    ];

    for (const [file, css, sel] of cases) {
      // Escape the selector, then take the FIRST rule block that opens with it
      // exactly — anchored on a line start so `.mb-nav-cta` cannot match inside
      // `.mb-nav--overlay:not(.is-solid) .mb-nav-cta`.
      const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rule = css.match(new RegExp(`^${esc}(?:,[^{]*)?\\s*\\{([^}]*)\\}`, "m"));
      expect(rule, `${file}: no rule found for ${sel} — did the selector change?`).not.toBeNull();
      const body = rule![1];
      if (!/background:/.test(body)) continue; // rule exists but sets no fill
      expect(body, `${file} ${sel}`).not.toMatch(/background:\s*var\(--mb-primary\)\s*;/);
      expect(body, `${file} ${sel}`).not.toMatch(/background:\s*var\(--mb-primary-hover\)\s*;/);
    }
  });
});

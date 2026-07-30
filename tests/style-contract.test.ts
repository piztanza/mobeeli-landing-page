import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import contract from "../design/R25-STYLE-CONTRACT.json";

/**
 * The design style contract (CD's protocol fix, adopted 2026-07-30 with the
 * founder's "go"): design/R25-STYLE-CONTRACT.json is GENERATED from the
 * mockup's authored styles — when design changes, CD re-ships the JSON and
 * the diff is reviewable here. This suite asserts that the declarations we
 * claim to honor really are in landing.css, and it ENCODES the precedence
 * rule: founder ruling → mockup → prose. Founder-ruled exceptions are listed
 * explicitly so a contract re-generation cannot silently revert a ruling.
 */
const css = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/** Parse a contract style string into declarations. */
const DECL = (s: string): Record<string, string> =>
  Object.fromEntries(
    s
      .split(";")
      .filter(Boolean)
      .map((d) => {
        const i = d.indexOf(":");
        return [d.slice(0, i).trim(), d.slice(i + 1).trim()];
      }),
  );

/** ALL rule bodies whose selector list contains the fragment, joined —
 * selectors recur across media resets and split shadow rules, so the
 * assertion is "some rule for this selector carries the value". */
const rule = (selector: string): string => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bodies: string[] = [];
  const re = /([^{}]+)\{([^}]*)\}/gs;
  for (const m of css.matchAll(re)) {
    if (m[1].includes(selector) || new RegExp(esc).test(m[1])) bodies.push(m[2]);
  }
  return bodies.join("\n---\n");
};

describe("R25 style contract — honored values", () => {
  /** hook → [selector, contract property, expected fragment in our CSS] */
  const HONORED: [keyof typeof contract, string, string, string][] = [
    ["picker-surface", ".mb-cat-panels > .mb-cat-ymm", "background", "172deg"],
    ["picker-rim", ".mb-cat-panels > .mb-cat-ymm", "background", "158deg"],
    ["picker-surface", ".mb-cat-ymm", "padding", "padding: 20px"],
    ["window-body", ".mb-cat-window-body", "padding", "padding: 18px 18px 22px"],
    ["window-bar", ".mb-cat-window-bar", "padding", "padding: 13px 17px"],
    ["window-query", ".mb-cat-window-search", "background", "rgba(8, 13, 20, 0.6)"],
    ["genuine-badge", ".mb-cat-genuine", "top", "top: 9px"],
    ["plate-blueprint", ".mb-cat-card-img-wrap::before", "background-size", "16px 16px"],
    ["card-info", ".mb-cat-card-info", "padding", "padding: 8px 14px 15px"],
    ["sku-disc", ".mb-cat-sku-icon", "width", "width: 40px"],
    ["sku-card", ".mb-cat-panels > .mb-cat-sku", "background", "rgba(30, 44, 66, 0.92)"],
    ["vin-btn", ".mb-vin-btn", "padding", "padding: 9px 15px"],
    ["engine-chip", ".mb-ymm-engine-code", "color", "#9dc2fa"],
    ["result-counts", ".mb-cat-count", "font-variant-numeric", "tabular-nums"],
  ];

  it.each(HONORED)("honors %s (%s)", (hook, selector, prop, fragment) => {
    // The contract really authors this property…
    expect(DECL(contract[hook])[prop], `${hook} lacks ${prop} in the contract`).toBeDefined();
    // …and our stylesheet really carries the agreed value.
    expect(rule(selector), `${selector} missing ${fragment}`).toContain(fragment);
  });

  it("carries the .4 panel edge-light the contract insists on (not the glass system's .22)", () => {
    expect(contract["picker-surface"]).toContain("rgba(255,255,255,.4)");
    expect(rule(".mb-cat-panels > .mb-cat-ymm")).toContain(
      "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
    );
    expect(rule(".mb-cat-panels > .mb-cat-window")).toContain(
      "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
    );
  });

  it("FOUNDER-RULED EXCEPTIONS: the contract does not override rulings", () => {
    // 1. Plate aspect: authored 3/2, founder approved the rendered 23/18
    //    twice (2026-07-29) — CD updates the mockup, not us.
    expect(DECL(contract["part-plate"])["aspect-ratio"]).toBe("3/2");
    expect(rule(".mb-cat-card-img-wrap")).toContain("aspect-ratio: 23 / 18");
    // 2. The panel-grain layer (baseFrequency 2.4): CD's own correction says
    //    it never rendered in their mockup; the approved look has no grain.
    //    Parked, not built. (An older hero noise layer at baseFrequency 3
    //    exists and is unrelated.)
    expect(css).not.toMatch(/baseFrequency='2\.4'|baseFrequency="2\.4"/);
  });
});

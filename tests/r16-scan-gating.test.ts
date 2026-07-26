import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentSection, { SCAN_DURATION_MS } from "@/components/landing/FitmentSection";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

/**
 * R16 Bugs A + B — the scan sweep — plus R16 §8, the scan choreography.
 *
 * Bug A: `.is-scanning` was applied by FitmentSection but appeared ZERO times in
 * landing.css, while `.mb-cat-scan-line` carried `animation: … infinite`
 * unconditionally. The "scan animation" was permanent idle motion.
 *
 * Bug B: that infinite animation had no `prefers-reduced-motion` gate at all.
 *
 * §8 (founder ruling 4a) replaced the decorative sweep with a clinical
 * measurement pass. Both bugs are now easy to reintroduce in a new form — one
 * ungated `animation:` on any of the five new elements brings the idle motion
 * straight back — so the gating assertions below are written to sweep the whole
 * rule set rather than to name individual selectors.
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

const component = readFileSync(
  new URL("../src/components/landing/FitmentSection.tsx", import.meta.url),
  "utf8",
);

const html = renderToStaticMarkup(
  createElement(LanguageProvider, null, createElement(FitmentSection)),
);

/** CSS with comments stripped — prose about a selector is not a rule for it. */
const css = landingCss.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Every `selector { body }` pair, with `@keyframes` bodies removed so their
 * percentage steps are not mistaken for rules. Rules nested in an `@media`
 * block are returned like any other — the wrapper itself never matches,
 * because its body contains braces.
 */
/** One `@keyframes` block, braces and all — `[^}]*` cannot span its steps. */
function keyframes(name: string): string {
  const re = new RegExp(`@keyframes ${name} \\{(?:[^{}]*\\{[^{}]*\\})*[^{}]*\\}`, "s");
  return css.match(re)?.[0] ?? "";
}

function rules(source: string): Array<{ sel: string; body: string }> {
  const flat = source.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const out: Array<{ sel: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(flat)) !== null) out.push({ sel: m[1].trim(), body: m[2] });
  return out;
}

/** The body of every `@media (prefers-reduced-motion: reduce)` block. */
function reducedMotionBlocks(css: string): string {
  const out: string[] = [];
  const marker = "@media (prefers-reduced-motion: reduce)";
  for (let at = css.indexOf(marker); at >= 0; at = css.indexOf(marker, at + 1)) {
    let depth = 0;
    let i = css.indexOf("{", at);
    const start = i;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    out.push(css.slice(start, i));
  }
  return out.join("\n");
}

describe("Bug A — the sweep only runs during an actual scan", () => {
  it("gates the animation behind .is-scanning, which the component really sets", () => {
    expect(landingCss).toMatch(
      /\.mb-cat-car-wrapper\.is-scanning \.mb-cat-scan-line \{[^}]*animation: mb-cat-scan/s,
    );
    expect(component).toContain("is-scanning");
  });

  it("never animates infinitely — one pass per scan", () => {
    expect(landingCss).not.toMatch(/\.mb-cat-scan-line \{[^}]*animation:[^;]*infinite/s);
    expect(landingCss).toMatch(/animation: mb-cat-scan \d+ms linear 1 forwards;/);
  });

  it("is invisible at rest", () => {
    expect(landingCss).toMatch(/\.mb-cat-scan-line \{[^}]*opacity: 0;/s);
  });
});

describe("Bug B — reduced motion is respected", () => {
  it("suppresses the sweep under prefers-reduced-motion", () => {
    expect(reducedMotionBlocks(landingCss)).toMatch(
      /\.mb-cat-car-wrapper\.is-scanning \.mb-cat-scan-line \{[^}]*animation: none;/s,
    );
  });
});

describe("timing contract — CSS and TypeScript cannot drift apart", () => {
  it("authors the sweep to exactly SCAN_DURATION_MS", () => {
    // They were 1.5s (CSS) vs 1800ms (TS), so the sweep was cut off mid-pass.
    const match = landingCss.match(/animation: mb-cat-scan (\d+)ms linear 1 forwards;/);
    expect(match, "sweep duration declaration").not.toBeNull();
    expect(Number(match![1])).toBe(SCAN_DURATION_MS);
  });
});

/* ── R16 §8 — the scan choreography (founder ruling 4a) ──────────────────── */

/** The five elements the pass animates. Every gating assertion sweeps all of them. */
const READOUT = [
  "mb-cat-scan-line",
  "mb-cat-scan-dot",
  "mb-cat-scan-leader",
  "mb-cat-scan-val",
  "mb-cat-scan-lock",
] as const;

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

/** delay/duration of each callout element, from the ruling's timing table. */
const CALLOUTS = [
  { n: 1, mark: 500, value: 550 },
  { n: 2, mark: 800, value: 850 },
  { n: 3, mark: 1020, value: 1070 },
] as const;

describe("§8 — a measured pass, not a decorative sweep", () => {
  it("traverses the frame top-to-bottom over its full height", () => {
    // The old sweep slid a full-height gradient sideways (left: -100% -> 100%).
    // 139px is the 140px frame less the 1px line: change one and this fails.
    expect(css).toMatch(/\.mb-cat-car-wrapper \{[^}]*height: 140px;/s);
    expect(keyframes("mb-cat-scan")).toContain("translateY(139px)");
    expect(keyframes("mb-cat-scan")).not.toContain("left: -100%");
  });

  it("splits the pass into acquire / traverse / settle", () => {
    const frames = keyframes("mb-cat-scan");
    // 12% and 73% of 1800ms are the 216ms and 1314ms phase boundaries.
    expect(frames).toContain("12%");
    expect(frames).toContain("73%");
    expect(SCAN_DURATION_MS * 0.12).toBe(216);
    expect(SCAN_DURATION_MS * 0.73).toBe(1314);
  });

  it("really puts the readout in the DOM — a rule nothing applies proves nothing", () => {
    // The R13 lesson: `.mb-fit3d .mb-cat-card` was asserted to exist in the CSS,
    // did exist, and matched no element on the page for months.
    for (const cls of [...READOUT, "mb-cat-car-grid", "mb-cat-scan-readout", "mb-cat-scan-lock-t"]) {
      expect(css, `${cls} rule`).toContain(`.${cls}`);
      expect(html, `${cls} in markup`).toContain(cls);
    }
    for (const { n } of CALLOUTS) {
      expect(html, `callout ${n}`).toContain(`mb-cat-scan-callout--${n}`);
      expect(css, `callout ${n} rule`).toContain(`.mb-cat-scan-callout--${n}`);
    }
  });

  it("staggers the callouts to the ruled timings, one value read at a time", () => {
    expect(css).toContain(`animation: mb-cat-scan-dot 300ms ${EASE} 1 both;`);
    expect(css).toContain(`animation: mb-cat-scan-leader 450ms ${EASE} 1 both;`);
    expect(css).toContain(`animation: mb-cat-scan-val 500ms ${EASE} 1 both;`);
    expect(css).toContain(`animation: mb-cat-scan-lock 500ms ${EASE} 1300ms 1 both;`);

    for (const { n, mark, value } of CALLOUTS) {
      const delayed = (el: string) =>
        rules(css)
          .filter((r) => r.sel.includes(`--${n} `) && r.sel.includes(el))
          .map((r) => r.body)
          .join(" ");
      expect(delayed("mb-cat-scan-dot"), `callout ${n} dot`).toContain(`animation-delay: ${mark}ms`);
      expect(delayed("mb-cat-scan-leader"), `callout ${n} leader`).toContain(
        `animation-delay: ${mark}ms`,
      );
      expect(delayed("mb-cat-scan-val"), `callout ${n} value`).toContain(
        `animation-delay: ${value}ms`,
      );
    }
  });

  it("lands every callout inside the pass — nothing outlives the scan", () => {
    // The lock is the last thing to arrive and finishes exactly on 1800ms.
    for (const { value } of CALLOUTS) expect(value + 500).toBeLessThanOrEqual(SCAN_DURATION_MS);
    expect(1300 + 500).toBe(SCAN_DURATION_MS);
  });

  it("anchors each dot where the line actually is at its trigger time", () => {
    // Otherwise the value reads as printed over the car, not measured from it.
    const travel = (atMs: number) => Math.round(((atMs - 216) / (1314 - 216)) * 139);
    const topOf = (n: number) =>
      Number(css.match(new RegExp(`\\.mb-cat-scan-callout--${n} \\{[^}]*top: (\\d+)px`, "s"))?.[1]);
    for (const { n, mark } of CALLOUTS) {
      expect(Math.abs(topOf(n) - travel(mark)), `callout ${n} anchor`).toBeLessThanOrEqual(1);
    }
  });
});

describe("Bug A (§8) — nothing on the band moves while it is idle", () => {
  it("gates EVERY scan animation behind .is-scanning", () => {
    const animated = rules(css).filter(
      (r) =>
        r.sel.includes("mb-cat-scan") &&
        /\banimation(-[a-z]+)?:/.test(r.body) &&
        !/animation: none/.test(r.body),
    );
    // Guard against the assertion going vacuous: if a refactor renames the
    // classes, this sweep must fail loudly rather than pass over an empty set.
    expect(animated.length, "scan rules carrying an animation").toBeGreaterThanOrEqual(
      READOUT.length,
    );
    const ungated = animated.filter((r) => !r.sel.includes(".is-scanning"));
    expect(ungated.map((r) => r.sel), "ungated scan animations").toEqual([]);
  });

  it("rests every readout element at opacity 0", () => {
    for (const cls of READOUT) {
      expect(css, `${cls} rest state`).toMatch(
        new RegExp(`\\.${cls} \\{[^}]*opacity: 0;`, "s"),
      );
    }
  });

  it("keeps the static measurement grid free of animation", () => {
    expect(css).toMatch(/\.mb-cat-car-grid \{(?:(?!\}).)*\}/s);
    const grid = css.match(/\.mb-cat-car-grid \{([^}]*)\}/s)?.[1] ?? "";
    expect(grid).not.toMatch(/animation|transition/);
  });
});

describe("Bug B (§8) — reduced motion shows the FINISHED reading", () => {
  const rm = reducedMotionBlocks(css);

  it("cancels every gated animation at matching specificity", () => {
    // A media query adds no specificity: `.mb-cat-car-wrapper .mb-cat-scan-dot`
    // (0,2,0) loses to the `.is-scanning` rule (0,3,0) and the animation keeps
    // running for exactly the users it is meant to spare.
    for (const cls of READOUT) {
      expect(rm, `${cls} cancelled`).toMatch(
        new RegExp(`\\.mb-cat-car-wrapper\\.is-scanning \\.${cls}[^{]*\\{[^}]*animation: none;`, "s"),
      );
    }
  });

  it("shows the reading rather than hiding it", () => {
    // Hiding the result would withhold the answer from the people who asked for
    // no motion. Only the traversing line is suppressed.
    for (const cls of READOUT.filter((c) => c !== "mb-cat-scan-line")) {
      expect(rm, `${cls} held visible`).toMatch(
        new RegExp(`\\.mb-cat-car-wrapper \\.${cls}[^{]*\\{[^}]*opacity: 1;`, "s"),
      );
    }
    expect(rm).toMatch(/\.mb-cat-scan-line \{[^}]*opacity: 0;/s);
  });

  it("never resets the transform that centres a value label", () => {
    // `transform: none` here — which the brief's snippet suggested — would drop
    // .mb-cat-scan-val's translateY(-50%) and shift all three labels down.
    // (Other bands legitimately reset transforms, so scope this to the scan.)
    const scanReset = rules(rm)
      .filter((r) => r.sel.includes("mb-cat-scan"))
      .map((r) => r.body)
      .join(" ");
    expect(scanReset).not.toContain("transform: none");
    expect(css).toMatch(/\.mb-cat-scan-val \{[^}]*transform: translateY\(-50%\);/s);
    expect(css).toContain("to { transform: translate(0, -50%); opacity: 1; }");
  });

  it("drives the gate from CSS, not from React state", () => {
    // useReducedMotion() is for JS-driven motion; a media query cannot desync
    // from the .is-scanning class the way a second source of truth can.
    expect(component).not.toContain("useReducedMotion");
  });
});

describe("§8 — copy and accessibility", () => {
  it("ships the callout strings in both languages", () => {
    for (const key of ["cat_scan_pcd", "cat_scan_offset", "cat_scan_lock"] as const) {
      for (const lang of langs) expect(t(lang, key), `${lang}.${key}`).toBeTruthy();
      expect(html, key).toContain(t("en", key));
    }
  });

  it("reuses the stamped bore string instead of duplicating it", () => {
    expect(component).toContain('t("fit3d_bore_v")');
    expect(html).toContain(t("en", "fit3d_bore_v"));
    expect(t("id", "fit3d_bore_v"), "ID comma decimal").toContain("54,1");
  });

  it("hardcodes no callout copy in the component", () => {
    const jsx = component.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
    expect(jsx).not.toContain("PCD 4");
    expect(jsx).not.toContain("ET 45");
    expect(jsx).not.toContain("2NR-VE");
  });

  it("keeps the readout out of the accessible tree", () => {
    // It sits in the DOM at opacity 0 permanently, so an exposed layer would
    // announce three measurements and a vehicle lock even at rest. The real
    // result stays readable: the garage chip and the per-card verified badge.
    expect(html).toMatch(/class="mb-cat-scan-readout"[^>]*aria-hidden/);
  });
});

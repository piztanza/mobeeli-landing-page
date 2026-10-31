import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FitmentFlow, { RESOLVE, RUN, partPickRun } from "@/components/solutions/FitmentFlow";
import { DEMO_PARTS, DEMO_VEHICLES, defaultPartFor } from "@/components/solutions/fitmentDemo";
import { checkPart } from "@/components/solutions/fitmentSolver";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

/**
 * The /solutions fitment-flow explainer (2026-10-31, three panels): the car
 * from Mobeeli's Indonesian vehicle data → the fitment engine → the store, with
 * the shopper's car in My Garage. Three layers of contract:
 *   1. the demo catalogue always shows BOTH outcomes, from computed verdicts;
 *   2. the server render is the complete, resolved figure (no-JS and reduced
 *      motion see everything; motion only ever arms a start state on top);
 *   3. the stylesheet gates every animation and keeps green to the verified
 *      signal — swept over the whole file, not named selectors (r16 lesson).
 */

const html = renderToStaticMarkup(
  createElement(LanguageProvider, null, createElement(FitmentFlow)),
);
const src = readFileSync(
  new URL("../src/components/solutions/FitmentFlow.tsx", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../src/components/solutions/solutions-page.css", import.meta.url),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/** The motion block's opening — screen only, so a print never catches stage 0. */
const MOTION_BLOCK = "@media screen and (prefers-reduced-motion: no-preference)";

/** Every `selector { body }` inside the motion block (one level of nesting). */
function motionRules(): Array<{ sel: string; body: string }> {
  const start = css.indexOf(MOTION_BLOCK);
  let depth = 0;
  let i = css.indexOf("{", start);
  const open = i;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) break;
  }
  const inner = css.slice(open + 1, i);
  return [...inner.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    sel: m[1].trim(),
    body: m[2],
  }));
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("demo catalogue — computed, and always shows both outcomes", () => {
  it("offers at least three Indonesian-market vehicles and four parts", () => {
    expect(DEMO_VEHICLES.length).toBeGreaterThanOrEqual(3);
    expect(DEMO_PARTS.length).toBeGreaterThanOrEqual(4);
  });

  it.each(DEMO_VEHICLES.map((v) => [v.id, v] as const))(
    "%s: at least one part fits and at least one does not",
    (_, vehicle) => {
      const verdicts = DEMO_PARTS.map((p) => checkPart(vehicle.fitment, p.spec).fits);
      expect(verdicts).toContain(true);
      expect(verdicts).toContain(false);
    },
  );

  it.each(DEMO_VEHICLES.map((v) => [v.id, v] as const))(
    "%s: opens on a part that fits, so the first impression is a verified fit",
    (_, vehicle) => {
      const part = DEMO_PARTS.find((p) => p.id === defaultPartFor(vehicle));
      expect(part).toBeDefined();
      expect(checkPart(vehicle.fitment, part!.spec).fits).toBe(true);
    },
  );

  it("names every vehicle and part through the copy maps, in both languages", () => {
    for (const lang of langs) {
      for (const v of DEMO_VEHICLES) expect(t(lang, v.name).trim()).not.toBe("");
      for (const p of DEMO_PARTS) expect(t(lang, p.name).trim()).not.toBe("");
    }
  });
});

describe("server render — the resolved figure", () => {
  it("is a figure whose meaning reaches assistive tech as one caption", () => {
    expect(html).toContain("<figure");
    expect(html).toContain(esc(t("en", "sol_fx_a11y")));
  });

  it("ships fully resolved: the last stage, 3", () => {
    expect(html).toContain('data-stage="3"');
  });

  // Decongested (2026-10-31): three numbered panels — the car, the fitment
  // engine, the store with My Garage. The catalogue and garage panels and the
  // progress rail are gone; their jobs moved into the three that remain.
  it("draws exactly three panels, in flow order", () => {
    const order = ["mb-sol-node--veh", "mb-sol-engine", "mb-sol-node--store"].map((c) =>
      html.indexOf(c),
    );
    for (const at of order) expect(at).toBeGreaterThan(0);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    for (const gone of ["mb-sol-node--cat", "mb-sol-node--garage", "mb-sol-rail"]) {
      expect(html, gone).not.toContain(gone);
    }
  });

  it("offers each demo car as a native radio, the first one checked", () => {
    const radios = html.match(/<input[^>]*type="radio"[^>]*name="[^"]*car[^"]*"[^>]*>/g) ?? [];
    expect(radios.length).toBe(DEMO_VEHICLES.length);
    expect(radios[0]).toContain("checked");
    for (const v of DEMO_VEHICLES) expect(html).toContain(esc(t("en", v.name)));
  });

  it("makes every storefront tile a selectable part, one radio each", () => {
    const radios = html.match(/<input[^>]*type="radio"[^>]*name="[^"]*part[^"]*"[^>]*>/g) ?? [];
    expect(radios.length).toBe(DEMO_PARTS.length);
  });

  // The line names the car and what is hidden: two cars can share a count
  // ("2 of 4"), and a live region that does not change says nothing.
  it("states the default car's computed count, by name, in a polite live region", () => {
    const car = DEMO_VEHICLES[0];
    const fit = DEMO_PARTS.filter((p) => checkPart(car.fitment, p.spec).fits).length;
    const line = t("en", "sol_fx_count")
      .replace("{fit}", String(fit))
      .replace("{total}", String(DEMO_PARTS.length))
      .replace("{car}", t("en", car.name))
      .replace("{hidden}", String(DEMO_PARTS.length - fit));
    expect(html).toMatch(/aria-live="polite"/);
    expect(html).toContain(esc(line));
  });

  // "Only what fits goes live": the storefront says the dimmed rows are hidden
  // from shoppers and shown here for inspection, so the panel and the headline
  // agree.
  it("tells the reader that shoppers only see what fits", () => {
    expect(html).toContain(esc(t("en", "sol_fx_store_s")));
    expect(t("en", "sol_fx_count")).toContain("{hidden}");
  });

  it("shows the verified signal and the rejection, with the reason for the rejection", () => {
    expect(html).toContain(esc(t("en", "cat_part_verified")));
    expect(html).toContain(esc(t("en", "cat_chip_unfit")));
    // On the Atto 3 the flow-formed wheel is rejected for its bolt circle.
    expect(html).toContain(esc(`${t("en", "sol_fx_ck_pcd")} 5 × 120`));
  });

  it("marks the run kind on the figure, so a part pick can leave the storefront alone", () => {
    expect(html).toContain('data-run="car"');
  });

  it("names the saved car in the store's My Garage chip", () => {
    const car = DEMO_VEHICLES[0];
    const store = html.slice(html.indexOf("mb-sol-node--store"));
    expect(store).toContain(esc(t("en", "garage_chip_label")));
    expect(store).toContain(esc(t("en", car.name)));
  });

  it("labels the sample data as a simulation (honesty contract)", () => {
    expect(html).toContain(esc(t("en", "cat_sim_tag")));
  });

  it("uses next/image for the brand mark, never a raw <img> in source", () => {
    expect(src).toContain('from "next/image"');
    expect(src).not.toMatch(/<img[\s>]/);
  });
});

describe("motion contract — gated by useReducedMotion and the media query", () => {
  it("reads the central reduced-motion gate", () => {
    expect(src).toContain("useReducedMotion");
  });

  it("ends every run, full or part, at the resolved stage 3", () => {
    for (const steps of [RUN, RESOLVE]) {
      expect(steps[steps.length - 1][1]).toBe(3);
      const times = steps.map(([at]) => at);
      expect(times, "steps in time order").toEqual([...times].sort((a, b) => a - b));
    }
  });

  // A part picked while a car run is still playing re-solves INSIDE that run:
  // a part run would drop the store's car-run holds at once, so the new car's
  // verdicts landed before the engine had solved and link b never ran
  // (review, 2026-10-31). Once the run has reached the store, only the engine
  // re-solves.
  it("keeps a part pick inside a car run that has not reached the store", () => {
    for (const stage of [0, 1, 2] as const)
      expect(partPickRun("car", stage), `${stage}`).toBe("car");
    expect(partPickRun("car", 3)).toBe("part");
    for (const stage of [0, 1, 2, 3] as const) expect(partPickRun("part", stage)).toBe("part");
  });

  // A part pick re-solves the engine only. The store's verdicts depend on the
  // car alone, so hiding them on a part pick blanked the whole panel for over a
  // second (review, 2026-10-31).
  it("holds back the storefront only on a full car run", () => {
    const storeHolds = motionRules().filter(
      ({ sel, body }) => /mb-sol-count|mb-sol-tile/.test(sel) && /opacity:\s*[01];/.test(body),
    );
    expect(storeHolds.length, "store hold rules").toBeGreaterThan(0);
    for (const { sel } of storeHolds) expect(sel, sel).toContain('[data-run="car"]');
  });

  it("scopes the motion block to the screen, so a print shows the resolved figure", () => {
    expect(css).toContain(MOTION_BLOCK);
    expect(css).not.toMatch(/@media \(prefers-reduced-motion: no-preference\)/);
  });

  it("declares every animation and every transition inside the motion block", () => {
    // Strip the gated blocks; whatever is left must carry no motion at all.
    const blocks = css.split(MOTION_BLOCK);
    const outside = [blocks[0]];
    for (const tail of blocks.slice(1)) {
      // Drop the gated block body: balanced braces from the first "{".
      let depth = 0;
      let i = tail.indexOf("{");
      for (; i < tail.length; i++) {
        if (tail[i] === "{") depth++;
        else if (tail[i] === "}" && --depth === 0) break;
      }
      outside.push(tail.slice(i + 1));
    }
    const ungated = outside.join("\n");
    expect(ungated, "ungated animation").not.toMatch(/animation\s*:/);
    expect(ungated, "ungated transition").not.toMatch(/transition\s*:/);
  });

  it("defines every keyframes block it animates with", () => {
    const used = [...css.matchAll(/animation\s*:\s*([\w-]+)/g)].map((m) => m[1]);
    for (const name of used) expect(css, `@keyframes ${name}`).toContain(`@keyframes ${name}`);
  });
});

describe("material + palette contract", () => {
  // In forced colours the selected car or part was told apart only by a tinted
  // background and border, both of which the system palette flattens. The
  // Highlight rule must also OUT-RANK the tinted selection rules (0,3,0): a
  // bare `+ label` (0,2,1) lost them the border-colour, so only the 2px width
  // landed and Highlight never showed (review, 2026-10-31). (0,3,1) wins
  // wherever the rules sit in the file.
  it("marks the selected car and part in forced-colours mode, out-ranking the tint", () => {
    const block = css.slice(css.indexOf("@media (forced-colors: active)"));
    expect(block).toMatch(
      /^@media \(forced-colors: active\) \{\s*\.mb-sol-radio:checked \+ label:is\(\.mb-sol-car-l, \.mb-sol-tile\) \{[^}]*border: 2px solid Highlight;/,
    );
    expect(css).toContain(".mb-sol-radio:checked + .mb-sol-car-l {");
    expect(css).toContain(".mb-sol-radio:checked + .mb-sol-tile {");
  });

  it("ships no class without a rule (the rail's old is-active)", () => {
    expect(src).not.toContain("is-active");
  });

  it("adds no glass recipe of its own and never hand-writes the -webkit- blur", () => {
    expect(css).not.toContain("backdrop-filter");
    expect(src).toContain("mb-glass");
  });

  it("keeps green to the verified signal, by the exact tokens the site allows", () => {
    const allowed = ["rgba(16, 185, 129, 0.13)", "rgba(16, 185, 129, 0.3)", "#34d399", "#10b981"];
    const hits = css.match(/#10b981|#34d399|rgba\(16, ?185, ?129[^)]*\)/gi) ?? [];
    for (const hit of hits) {
      expect(
        allowed.some((a) => a.replace(/\s/g, "") === hit.toLowerCase().replace(/\s/g, "")),
        `unexpected green ${hit}`,
      ).toBe(true);
    }
    expect(css.toLowerCase()).not.toContain("#818cf8");
    expect(src).not.toMatch(/#10b981|#34d399/i);
  });
});

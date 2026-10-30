import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SolutionsPage, { metadata } from "@/app/solutions/page";
import sitemap from "@/app/sitemap";
import { copy, langs, t, type CopyKey } from "@/lib/i18n";

/**
 * /solutions — what Mobeeli provides (2026-10-31). The flagship product page:
 * an intro with a product index, the interactive fitment-flow explainer, the
 * four product pillars and a closing CTA. These assertions read the rendered
 * page, not source strings, so a pillar that stops rendering fails here even
 * if its copy keys survive.
 */

/** Escape a copy string the way React escapes text content in SSR output. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const html = renderToStaticMarkup(<SolutionsPage />);

/** Product anchors in the brief's order: data API, fitment engine, catalogs, storefronts. */
const PILLARS = [
  { id: "vehicle-data", title: "sol_p1_t" },
  { id: "fitment-search", title: "sol_p2_t" },
  { id: "catalogs", title: "sol_p3_t" },
  { id: "storefronts", title: "sol_p4_t" },
] as const satisfies readonly { id: string; title: CopyKey }[];

describe("/solutions page structure", () => {
  it("has exactly one h1, the page title, inside <main>", () => {
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    expect(main).toContain(esc(t("en", "sol_h1")));
  });

  it("renders the four pillars in the brief's order, each with its own anchor", () => {
    let last = -1;
    for (const { id, title } of PILLARS) {
      const at = html.indexOf(`id="${id}"`);
      expect(at, `#${id}`).toBeGreaterThan(last);
      expect(html.indexOf(esc(t("en", title)), at), `${title} inside #${id}`).toBeGreaterThan(at);
      last = at;
    }
  });

  it("indexes every pillar from the intro, before the explainer", () => {
    const flow = html.indexOf('id="fitment-flow"');
    expect(flow).toBeGreaterThan(0);
    for (const { id } of PILLARS) {
      const link = html.indexOf(`href="#${id}"`);
      expect(link, `index link to #${id}`).toBeGreaterThan(0);
      expect(link, `#${id} index link precedes the explainer`).toBeLessThan(flow);
    }
  });

  it("places the explainer between the intro and the pillars", () => {
    const intro = html.indexOf('id="solutions"');
    const flow = html.indexOf('id="fitment-flow"');
    const firstPillar = html.indexOf('id="vehicle-data"');
    expect(intro).toBeGreaterThan(0);
    expect(flow).toBeGreaterThan(intro);
    expect(firstPillar).toBeGreaterThan(flow);
    expect(html).toContain(esc(t("en", "sol_flow_h2")));
  });

  it("mounts the interactive explainer inside the flow band", () => {
    const flow = html.indexOf('id="fitment-flow"');
    const figure = html.indexOf('class="mb-sol-fig"');
    expect(figure, "the explainer figure").toBeGreaterThan(flow);
    expect(figure).toBeLessThan(html.indexOf('id="vehicle-data"'));
    expect(html).toContain(esc(t("en", "sol_fx_a11y")));
  });

  it("routes the CTAs to the contact form, the explainer and the Early Adopters signup", () => {
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    expect(main).toContain('href="/contact"');
    expect(main).toContain('href="#fitment-flow"');
    expect(main).toContain('href="https://company.mobeeli.com/join"');
    expect(main).toContain(esc(t("en", "sol_cta_h")));
  });
});

describe("/solutions wiring", () => {
  it("takes the free nav slot and the footer's product column", () => {
    const bar = html.match(/<div class="mb-nav-links">.*?<\/div>/s)?.[0] ?? "";
    expect(bar).toContain('href="/solutions"');
    const footer = html.slice(html.indexOf('class="mb-footer"'));
    expect(footer).toContain('href="/solutions"');
    expect(t("en", "nav_solutions")).toBe("Solutions");
    expect(t("id", "nav_solutions")).toBe("Solusi");
  });

  it("carries its own pipe title, the lede as description, and a canonical", () => {
    expect(metadata.title).toBe("Solutions | Mobeeli");
    expect(metadata.description).toBe(t("en", "sol_lede"));
    expect(metadata.alternates?.canonical).toBe("/solutions");
  });

  it("is listed in the sitemap", () => {
    expect(sitemap().some((entry) => entry.url.endsWith("/solutions"))).toBe(true);
  });

  // The shared section-page frame imports every section it maps statically, so
  // a Solutions entry there shipped the explainer's JS and CSS to /team,
  // /contact and the rest (review, 2026-10-31). The route passes it in instead.
  it("ships its bundle only on /solutions — the shared frame never imports it", () => {
    const frame = readFileSync(
      new URL("../src/components/landing/SectionPage.tsx", import.meta.url),
      "utf8",
    );
    expect(frame).not.toMatch(/components\/solutions/);
    const route = readFileSync(new URL("../src/app/solutions/page.tsx", import.meta.url), "utf8");
    expect(route).toMatch(/<SectionPage>\s*<Solutions \/>\s*<\/SectionPage>/);
  });
});

describe("/solutions copy rules (CLAUDE.md rule 2 + the design contract)", () => {
  const keys = (Object.keys(copy.en) as CopyKey[]).filter(
    (k) => k.startsWith("sol_") || k === "nav_solutions",
  );
  const entries = langs.flatMap((lang) =>
    keys.map((key) => ({ lang, key, value: copy[lang][key] })),
  );
  const offenders = (re: RegExp) =>
    entries.filter(({ value }) => re.test(value)).map((e) => `${e.lang}.${e.key}: ${e.value}`);

  it("ships a real set of keys in both languages", () => {
    expect(keys.length).toBeGreaterThan(40);
  });

  it("never promises a guarantee (the /guarantee/i veto, in both languages)", () => {
    expect(offenders(/guarant|garansi|jamin/i)).toEqual([]);
  });

  it("makes no real-time claim", () => {
    expect(offenders(/real[\s-]?time|waktu nyata/i)).toEqual([]);
  });

  it("states no fee or percentage figure", () => {
    expect(offenders(/\d+(?:[.,]\d+)?\s*%|komisi|commission/i)).toEqual([]);
  });

  it("names no marketplace and no competitor", () => {
    expect(
      offenders(/tokopedia|shopee|lazada|bukalapak|monotaro|blibli|convermax|x-?cart/i),
    ).toEqual([]);
  });

  it("uses no hype vocabulary and no emoji", () => {
    expect(
      offenders(
        /revolution|seamless|cutting[\s-]edge|best[\s-]in[\s-]class|world[\s-]class|game[\s-]chang|supercharg|effortless|high[\s-]converting|unlock|empower|next[\s-]gen/i,
      ),
    ).toEqual([]);
    expect(offenders(/\p{Extended_Pictographic}/u)).toEqual([]);
  });
});

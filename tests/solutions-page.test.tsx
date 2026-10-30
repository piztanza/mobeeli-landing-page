import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SolutionsPage, { metadata } from "@/app/solutions/page";
import sitemap from "@/app/sitemap";
import { copy, langs, t, type CopyKey } from "@/lib/i18n";

/**
 * /solutions — Mobeeli's SaaS page (redesigned 2026-10-31, decongested): a
 * short hero, six services, the three-panel fitment explainer, and pricing (a
 * one-time store build, three subscriptions and a price chart). These
 * assertions read the rendered page, not source strings, so a section that
 * stops rendering fails here even if its copy keys survive.
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

/** The slice of the page between one id and the next band. */
function section(id: string): string {
  const start = html.indexOf(`id="${id}"`);
  const next = html.indexOf("<section", start + 1);
  return html.slice(start, next === -1 ? undefined : next);
}

/** The six services, in the order the founder settled (only what is ready). */
const SERVICES = [
  "sol_svc1_t",
  "sol_svc2_t",
  "sol_svc3_t",
  "sol_svc4_t",
  "sol_svc5_t",
  "sol_svc6_t",
] as const satisfies readonly CopyKey[];

describe("/solutions page structure", () => {
  it("has exactly one h1, the page title, inside <main>", () => {
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    expect(main).toContain(esc(t("en", "sol_h1")));
  });

  it("runs hero → services → explainer → pricing, in that order", () => {
    const order = ["solutions", "services", "fitment-flow", "pricing"].map((id) =>
      html.indexOf(`id="${id}"`),
    );
    for (const at of order) expect(at).toBeGreaterThan(0);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("offers the two hero actions: talk to the team, or jump to pricing", () => {
    const hero = section("solutions");
    expect(hero).toContain('href="/contact"');
    expect(hero).toContain('href="#pricing"');
    expect(hero).toContain(esc(t("en", "sol_cta_pricing")));
  });

  it("lists the six services, each with its one-line description", () => {
    const services = section("services");
    for (const key of SERVICES) {
      expect(services, key).toContain(esc(t("en", key)));
      const d = key.replace(/_t$/, "_d") as CopyKey;
      expect(services, d).toContain(esc(t("en", d)));
    }
    expect(services.match(/class="mb-sol-svc"/g)?.length).toBe(SERVICES.length);
  });

  it("mounts the interactive explainer inside its own band", () => {
    const flow = section("fitment-flow");
    expect(flow).toContain('class="mb-sol-fig"');
    expect(flow).toContain(esc(t("en", "sol_fx_a11y")));
  });

  it("closes on the contact CTA and the Early Adopters signup", () => {
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    expect(main).toContain(esc(t("en", "sol_cta_h")));
    expect(main).toContain('href="https://company.mobeeli.com/join"');
  });
});

describe("/solutions pricing (founder decisions, 2026-10-31)", () => {
  const pricing = section("pricing");

  it("prices the store build as a one-time flat fee, quoted per store", () => {
    expect(pricing).toContain(esc(t("en", "sol_build_t")));
    expect(pricing).toContain(esc(t("en", "sol_build_billing")));
    expect(pricing).toContain(esc(t("en", "sol_build_price")));
  });

  it("lists what the build includes and the optional extras", () => {
    for (const key of [
      "sol_build_i1",
      "sol_build_i2",
      "sol_build_i3",
      "sol_build_i4",
      "sol_build_i5",
      "sol_build_e1",
      "sol_build_e2",
    ] as const) {
      expect(pricing, key).toContain(esc(t("en", key)));
    }
  });

  it("sells maintenance, SEO and the APIs as monthly subscriptions", () => {
    for (const key of ["sol_sub1_t", "sol_sub2_t", "sol_sub3_t"] as const) {
      expect(pricing, key).toContain(esc(t("en", key)));
    }
    expect(pricing.match(/class="mb-sol-sub"/g)?.length).toBe(3);
    expect(pricing).toContain(esc(t("en", "sol_sub_billing")));
  });

  it("charts all six offerings with their billing and price", () => {
    const chart = pricing.match(/<table class="mb-sol-chart">[\s\S]*?<\/table>/)?.[0] ?? "";
    expect(chart, "the price chart").not.toBe("");
    const rows = chart.slice(chart.indexOf("<tbody")).match(/<tr[\s>]/g) ?? [];
    expect(rows.length).toBe(6);
    expect(chart).toContain(esc(t("en", "sol_bill_once")));
    expect(chart).toContain(esc(t("en", "sol_bill_month")));
  });

  // No price figure anywhere: the build is "quoted per store" and every
  // subscription is "talk to our team" — which also keeps CLAUDE.md's rule
  // that Mobeeli's fees are never stated on the site.
  it("states no price amount in either language", () => {
    for (const lang of langs) {
      for (const [key, value] of Object.entries(copy[lang])) {
        if (!key.startsWith("sol_")) continue;
        expect(value, `${lang}.${key}`).not.toMatch(/\b(?:Rp|IDR|USD)\s?\d|\$\s?\d/i);
      }
    }
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

  // SEO is sold as a service, never as a result: no copy may promise a rank,
  // a first page or a placement in an AI answer.
  it("promises no ranking or AI placement", () => {
    expect(
      offenders(/\brank|first page|page one|top of google|halaman pertama|peringkat/i),
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

import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SolutionsPage, { metadata } from "@/app/solutions/page";
import sitemap from "@/app/sitemap";
import { copy, langs, t, type CopyKey } from "@/lib/i18n";

/**
 * /solutions — Mobeeli's SaaS page (redesigned 2026-10-31): a hero with a
 * sample store, six services, the three-panel fitment explainer, packages (three
 * store tiers by size, monthly subscriptions with levels, a comparison table —
 * never a price) and an FAQ. These assertions read the rendered page, not
 * source strings, so a section that stops rendering fails here even if its copy
 * keys survive.
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

  it("runs hero → services → explainer → packages → FAQ, in that order", () => {
    const order = ["solutions", "services", "fitment-flow", "packages", "faq"].map((id) =>
      html.indexOf(`id="${id}"`),
    );
    for (const at of order) expect(at).toBeGreaterThan(0);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("offers the two hero actions: talk to the team, or jump to the packages", () => {
    const hero = section("solutions");
    expect(hero).toContain('href="/contact"');
    expect(hero).toContain('href="#packages"');
    expect(hero).toContain(esc(t("en", "sol_cta_packages")));
  });

  // The hero's sample store is one image to a screen reader: a named role="img"
  // over a decorative composite of the parts cut-outs, tagged as a sample.
  it("shows a sample store beside the hero copy, named for screen readers", () => {
    const hero = section("solutions");
    expect(hero).toContain(
      `class="mb-sol-art" role="img" aria-label="${esc(t("en", "sol_art_label"))}"`,
    );
    const art = hero.slice(hero.indexOf('class="mb-sol-art"'));
    expect(art).toContain(esc(t("en", "sol_art_tag")));
    expect(art.match(/<img /g)?.length).toBe(3);
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

  // Interim duotone icons (2026-10-31), drawn in code until the commissioned
  // set lands: one per service, each built from its tint, fill and line layers
  // so the site can recolour them.
  it("draws every service as its own duotone icon", () => {
    const icons = section("services").split('<svg class="mb-sol-duo"').slice(1);
    expect(icons.map((icon) => icon.match(/^ data-icon="([a-z]+)"/)?.[1])).toEqual([
      "store",
      "catalog",
      "link",
      "plugin",
      "data",
      "search",
    ]);
    for (const icon of icons) {
      const svg = icon.slice(0, icon.indexOf("</svg>"));
      for (const layer of ["mb-sol-duo-bg", "mb-sol-duo-fill", "mb-sol-duo-line"]) {
        expect(svg, layer).toContain(`class="${layer}"`);
      }
    }
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

/** The three store packages, smallest first. */
const TIERS = [
  { name: "sol_tier1_t", forWhom: "sol_tier1_for", catalog: "sol_tier1_cat" },
  { name: "sol_tier2_t", forWhom: "sol_tier2_for", catalog: "sol_tier2_cat" },
  { name: "sol_tier3_t", forWhom: "sol_tier3_for", catalog: "sol_tier3_cat" },
] as const satisfies readonly { name: CopyKey; forWhom: CopyKey; catalog: CopyKey }[];

/** Every row of the comparison: the store features the platform already has,
 *  then what the bigger packages add (capability map, 2026-10-31). */
const COMPARED = [
  "sol_build_i1",
  "sol_build_i2",
  "sol_build_i3",
  "sol_build_i4",
  "sol_build_i5",
  "sol_build_i6",
  "sol_build_i7",
  "sol_build_i8",
  "sol_build_i9",
  "sol_build_i10",
  "sol_build_e1",
  "sol_cmp_terms",
  "sol_svc3_t",
  "sol_build_e2",
] as const satisfies readonly CopyKey[];

// Founder, 2026-10-31: packages and tiers by size, never prices — every package
// ends in "Talk to our team".
describe("/solutions packages (founder decisions, 2026-10-31)", () => {
  const packages = section("packages");
  const tiers = packages.split('<li class="mb-sol-tier"').slice(1);

  it("offers three store packages by size, smallest first", () => {
    expect(tiers.length).toBe(TIERS.length);
    TIERS.forEach((tier, i) => {
      for (const key of [tier.name, tier.forWhom, tier.catalog]) {
        expect(tiers[i], key).toContain(esc(t("en", key)));
      }
    });
  });

  it("gives every package its own duotone icon", () => {
    expect(
      tiers.map((tier) => tier.match(/<svg class="mb-sol-duo" data-icon="([a-z]+)"/)?.[1]),
    ).toEqual(["starter", "growth", "scale"]);
  });

  it("ends every package in a talk-to-our-team link", () => {
    for (const tier of tiers) {
      expect(tier).toContain('href="/contact"');
      expect(tier).toContain(esc(t("en", "sol_cta_talk")));
      expect(tier).toContain(esc(t("en", "sol_tier_bill")));
    }
  });

  it("builds each package on the one before it", () => {
    for (const i of [1, 2]) {
      const plus = t("en", "sol_tier_plus").replace("{tier}", t("en", TIERS[i - 1].name));
      expect(tiers[i]).toContain(esc(plus));
    }
  });

  it("says every store runs on a Maintenance subscription", () => {
    expect(packages).toContain(esc(t("en", "sol_pkg_note")));
  });

  it("sells maintenance, SEO and the APIs as monthly subscriptions, with levels", () => {
    expect(packages.match(/class="mb-sol-sub"/g)?.length).toBe(3);
    expect(packages).toContain(esc(t("en", "sol_sub_billing")));
    expect(packages.match(/class="mb-sol-levels"/g)?.length).toBe(2);
    for (const key of [
      "sol_sub1_lv1_t",
      "sol_sub1_lv2_t",
      "sol_sub2_lv1_t",
      "sol_sub2_lv2_t",
    ] as const) {
      expect(packages, key).toContain(esc(t("en", key)));
    }
  });

  it("compares the three packages feature by feature", () => {
    const table = packages.match(/<table class="mb-sol-compare">[\s\S]*?<\/table>/)?.[0] ?? "";
    expect(table, "the comparison table").not.toBe("");
    const head = table.slice(0, table.indexOf("</thead>"));
    for (const tier of TIERS) expect(head).toContain(esc(t("en", tier.name)));
    const rows = table.slice(table.indexOf("<tbody")).match(/<tr[\s>]/g) ?? [];
    expect(rows.length).toBe(COMPARED.length);
    for (const key of COMPARED) expect(table, key).toContain(esc(t("en", key)));
  });

  // Stock across branches is only partly built in the platform: it is offered
  // "by arrangement", never as a tick.
  it("offers stock across branches by arrangement, not as a tick", () => {
    const table = packages.match(/<table class="mb-sol-compare">[\s\S]*?<\/table>/)?.[0] ?? "";
    const row = table.slice(table.indexOf(esc(t("en", "sol_build_e2"))));
    expect(row.slice(0, row.indexOf("</tr>"))).toContain(esc(t("en", "sol_cmp_arr")));
  });

  // No price figure anywhere — which also keeps CLAUDE.md's rule that
  // Mobeeli's fees are never stated on the site.
  it("states no price amount in either language", () => {
    for (const lang of langs) {
      for (const [key, value] of Object.entries(copy[lang])) {
        if (!key.startsWith("sol_")) continue;
        expect(value, `${lang}.${key}`).not.toMatch(/\b(?:Rp|IDR|USD)\s?\d|\$\s?\d/i);
      }
    }
  });
});

describe("/solutions FAQ", () => {
  // Native <details>: keyboard and screen-reader support with no script, and
  // collapsed by default so five answers do not lengthen the page.
  it("answers five questions in native disclosures", () => {
    const items = section("faq").split('<details class="mb-sol-faq-item"').slice(1);
    expect(items.length).toBe(5);
    items.forEach((item, i) => {
      const q = esc(t("en", `sol_faq${i + 1}_q` as CopyKey));
      expect(item).toMatch(
        new RegExp(`<summary[^>]*>[\\s\\S]*${q.replace(/[.?*+^$()|[\]\\]/g, "\\$&")}`),
      );
      expect(item).toContain(esc(t("en", `sol_faq${i + 1}_a` as CopyKey)));
    });
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

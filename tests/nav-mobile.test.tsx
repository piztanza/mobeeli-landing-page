import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import JoinView from "@/components/join/JoinView";
import Nav from "@/components/landing/Nav";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { langs, t } from "@/lib/i18n";

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
const joinCss = readFileSync(new URL("../src/components/join/join.css", import.meta.url), "utf8");

/** The 5 nav links + Join CTA every viewport must offer (CHG-piztanza-10, R18 call A). */
const NAV_HREFS = [
  "/#problem",
  "/#how-it-works",
  "https://company.mobeeli.com/join",
  "/team",
  "/investors",
] as const;

describe("mobile hamburger nav (F-001, CHG-piztanza-10)", () => {
  const html = renderToStaticMarkup(
    <LanguageProvider>
      <Nav />
    </LanguageProvider>,
  );

  it("renders the hamburger toggle collapsed, wired to the sheet via ARIA", () => {
    const burger = html.match(/<button[^>]*mb-nav-burger[^>]*>/)?.[0] ?? "";
    expect(burger).toContain('aria-expanded="false"');
    expect(burger).toContain('aria-controls="mb-nav-sheet"');
    expect(burger).toContain(`aria-label="${t("en", "nav_menu_open")}"`);
  });

  it("has localized open/close labels in both languages", () => {
    for (const lang of langs) {
      expect(t(lang, "nav_menu_open")).toBeTruthy();
      expect(t(lang, "nav_menu_close")).toBeTruthy();
      expect(t(lang, "nav_menu_open")).not.toBe(t(lang, "nav_menu_close"));
    }
  });

  it("ships the sheet hidden by default with the 5 links, EN/ID toggle and Join CTA", () => {
    const sheetAt = html.indexOf('id="mb-nav-sheet"');
    expect(sheetAt).toBeGreaterThanOrEqual(0);
    const sheet = html.slice(sheetAt);
    const sheetTag = html.match(/<div[^>]*id="mb-nav-sheet"[^>]*>/)?.[0] ?? "";
    expect(sheetTag).toContain("hidden");
    for (const href of NAV_HREFS) {
      expect(sheet).toContain(`href="${href}"`);
    }
    expect(sheet).toContain('href="/join"');
    expect(sheet).toContain(">EN</button>");
    expect(sheet).toContain(">ID</button>");
  });

  it("keeps the desktop bar intact — links, toggle and CTA render before the sheet", () => {
    const bar = html.slice(0, html.indexOf('id="mb-nav-sheet"'));
    expect(bar).toContain('class="mb-nav-links"');
    for (const href of NAV_HREFS) {
      expect(bar).toContain(`href="${href}"`);
    }
    expect(bar).toContain('href="/join"');
    expect(bar).toContain(">EN</button>");
  });

  it("collapses at ~1040px and never leaks the sheet into the desktop nav (CSS contract)", () => {
    expect(landingCss).toContain("@media (max-width: 1039.98px)");
    const desktopGuard = landingCss.match(/@media \(min-width: 1040px\) \{[^}]*\}[^}]*\}/s)?.[0];
    expect(landingCss).toContain("@media (min-width: 1040px)");
    expect(desktopGuard).toContain(".mb-nav-sheet");
    expect(desktopGuard).toContain(".mb-nav-burger");
    expect(desktopGuard).toContain("display: none !important");
    // animated icon: bars fold into an X
    expect(landingCss).toMatch(/\.mb-nav-burger\.is-open \.mb-nav-burger-bar:nth-child\(1\)/);
    expect(landingCss).toMatch(/\.mb-nav-burger\.is-open \.mb-nav-burger-bar:nth-child\(3\)/);
  });

  it("meets mobile touch-target sizes in the sheet (CSS contract)", () => {
    expect(landingCss).toMatch(/\.mb-nav-burger \{[^}]*width: 44px;[^}]*height: 44px;/s);
    expect(landingCss).toMatch(/\.mb-nav-sheet-links a \{[^}]*min-height: 48px;/s);
    expect(landingCss).toMatch(/\.mb-nav-sheet \.mb-nav-cta \{[^}]*min-height: 44px;/s);
  });
});

describe("responsive audit CSS contracts (F-001, CHG-piztanza-10)", () => {
  it("proof bar collapses 4 → 2 → 1 at explicit breakpoints", () => {
    expect(landingCss).toMatch(/\.mb-proof-grid \{[^}]*repeat\(4, 1fr\)/s);
    expect(landingCss).toMatch(
      /@media \(max-width: 1023\.98px\) \{\s*\.mb-proof-grid \{[^}]*repeat\(2, 1fr\)/s,
    );
    expect(landingCss).toMatch(
      /@media \(max-width: 559\.98px\) \{\s*\.mb-proof-grid \{[^}]*grid-template-columns: 1fr/s,
    );
  });

  it("stacks the AI catalog stage in flow on phone with scaled sprites", () => {
    const phone = landingCss.slice(landingCss.indexOf("---------- responsive audit"));
    expect(phone).toMatch(/\.mb-cat-stage \{[^}]*position: relative;[^}]*width: 100%;/s);
    expect(phone).toMatch(/\.mb-sprite--pad \{[^}]*width: 30%;/s);
    expect(phone).toMatch(/\.mb-sprite--air \{[^}]*width: 28%;/s);
  });


  it("gives wizard inputs >=16px text and 44px touch targets (CSS contract)", () => {
    expect(joinCss).toMatch(/\.mb-jw-input \{[^}]*font-size: 16px;/s);
    const mobile = joinCss.slice(joinCss.indexOf("Mobile touch targets"));
    expect(mobile).toMatch(/\.mb-jw-tool \{[^}]*min-height: 44px;/s);
    expect(mobile).toMatch(/\.mb-jw-nextbtn \{[^}]*min-height: 44px;/s);
    expect(mobile).toMatch(/\.mb-jw-type \{[^}]*min-height: 44px;/s);
    expect(mobile).toMatch(/\.mb-jw-check \{[^}]*min-height: 44px;/s);
  });
});

describe("join page mobile nav (CHG-piztanza-10)", () => {
  const html = renderToStaticMarkup(<JoinView />);

  it("renders the shared logo + hamburger nav above the split", () => {
    const navWrap = html.indexOf("mb-join-mobilenav");
    expect(navWrap).toBeGreaterThanOrEqual(0);
    expect(html.indexOf('class="mb-join"')).toBeGreaterThan(navWrap);
    expect(html).toContain("mb-nav-burger");
    expect(html).toContain('aria-controls="mb-nav-sheet"');
    expect(html).toContain("mobeeli-logo-blue.png");
  });

  it("keeps the desktop split nav-free — the wrapper only shows below 880px (CSS contract)", () => {
    expect(joinCss).toMatch(/\.mb-join-mobilenav \{[^}]*display: none;/s);
    expect(joinCss).toMatch(
      /@media \(max-width: 879\.98px\) \{\s*\.mb-join-mobilenav \{[^}]*display: block;/s,
    );
  });
});

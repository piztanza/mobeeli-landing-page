import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The cookieless contract (founder 2026-07-30, after the cookie-popup
 * analysis): the site sets NO cookies, loads NOTHING from third parties and
 * runs NO analytics — which is exactly why it needs no consent banner, in
 * Indonesia (UU PDP has no banner mandate; nothing here is personal data)
 * and for EU visitors (the only device storage is user-requested UI
 * customization, the regulator-exempt category). This suite fails the
 * moment anyone silently breaks that position. If you trip it on purpose:
 * choose a cookieless tool (Plausible / Fathom / Vercel Web Analytics),
 * update the privacy page, and re-run the banner analysis — do not just
 * widen the allowlist.
 */

const SRC = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx|css)$/.test(name) ? [full] : [];
  });
}

const files = walk(SRC).map((path) => ({ path, text: readFileSync(path, "utf8") }));

describe("cookieless contract", () => {
  it("no code reads or writes document.cookie", () => {
    for (const { path, text } of files) {
      expect(text, path).not.toContain("document.cookie");
    }
  });

  it("no analytics or tracking SDK is referenced", () => {
    // Word-boundary patterns; comments count on purpose — naming a tracker
    // usually means someone is about to add it.
    const banned = [
      /\bgtag\(/,
      /googletagmanager|google-analytics/i,
      /\bposthog\b/i,
      /\bplausible\b/i,
      /\bfathom\b/i,
      /\bhotjar\b/i,
      /\bmixpanel\b/i,
      /\bsegment\.com\b/i,
      /\bfbq\(/,
      /facebook\.net/i,
      /doubleclick/i,
    ];
    for (const { path, text } of files) {
      for (const pattern of banned) {
        expect(text, `${path} matches ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("device storage stays on the two user-requested preference keys", () => {
    const writes = files.flatMap(({ path, text }) =>
      [...text.matchAll(/localStorage\.setItem\(\s*(["'][^"']+["']|[A-Z_]+)/g)].map((m) => ({
        path,
        key: m[1],
      })),
    );
    // mobeeli_garage (the picker's chosen vehicle) + LANG_STORAGE_KEY
    // ("mobeeli-lang", the pressed language toggle). Both are explicit user
    // choices — the consent-exempt category. A third key needs the same
    // analysis before it ships.
    expect(writes.length).toBe(2);
    const keys = writes.map((w) => w.key).sort();
    expect(keys).toEqual(['"mobeeli_garage"', "LANG_STORAGE_KEY"]);
    expect(files.some(({ text }) => text.includes('LANG_STORAGE_KEY = "mobeeli-lang"'))).toBe(true);
  });

  it("no external script, font or frame host is referenced in markup", () => {
    // Self-hosted everything: any http(s) URL in a src/href that is not a
    // mailto, an internal path, an allowed OUTBOUND link target or the
    // site's own domain is a third-party load waiting to happen.
    const allowedHosts = [
      "mobeeli.com", // canonical/self + subdomain platform links
      "company.mobeeli.com",
      "mobilee-demo.vercel.app",
      "mobeeli-landing-page.vercel.app",
      "www.linkedin.com", // outbound anchor targets, not resource loads
      "linkedin.com",
      "resend.com", // server-side mail API host in comments
      "vercel.com",
      "nextjs.org", // doc links in comments
      "www.w3.org", // SVG namespace
      "schema.org", // JSON-LD @context identifier, never fetched
      "api.vercel.com",
    ];
    const urlRe = /https?:\/\/([a-z0-9.-]+)/gi;
    for (const { path, text } of files) {
      for (const match of text.matchAll(urlRe)) {
        // Prose URLs in comments end sentences — strip trailing punctuation.
        const host = match[1].toLowerCase().replace(/[.-]+$/, "");
        expect(
          allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`)),
          `${path}: unexpected host ${host}`,
        ).toBe(true);
      }
    }
  });
});

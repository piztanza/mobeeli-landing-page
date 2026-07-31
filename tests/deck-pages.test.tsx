import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DeckAdminPage, { metadata as deckAdminMetadata } from "@/app/deck-admin/page";
import DeckPage, { metadata as deckMetadata } from "@/app/deck/page";
import sitemap from "@/app/sitemap";
import DeckRequestForm from "@/components/landing/DeckRequestForm";
import {
  MAX_CUSTOM_HOURS,
  ONE_HOUR_MS,
  deckAdminAuthorized,
  parseCustomHours,
  resolveDeckMint,
} from "@/lib/deck/admin";
import { mintDeckToken, verifyDeckToken } from "@/lib/deck/token";
import { t } from "@/lib/i18n";

const SECRET = "test-deck-secret";

/** Escape a copy string the way React escapes text content in SSR output. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function params(query: Record<string, string>): { searchParams: SearchParams } {
  return { searchParams: Promise.resolve(query) };
}

beforeEach(() => {
  vi.stubEnv("DECK_SECRET", SECRET);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("deck routes are private (F-016)", () => {
  it("/deck and /deck-admin are noindex and absent from the sitemap", () => {
    expect(deckMetadata.robots).toEqual({ index: false, follow: false });
    expect(deckAdminMetadata.robots).toEqual({ index: false, follow: false });
    for (const { url } of sitemap()) {
      expect(url).not.toContain("deck");
    }
  });
});

/**
 * Resend sends through Amazon SES; with click tracking on (mandatory on the
 * shared onboarding@resend.dev sender) a mailed link is rewritten through a
 * redirector that appends its tracking path to the target URL, so `key` and
 * `token` arrive with "/1/<message-id>/<hash>=473" glued on. Before this was
 * handled, the "Generate Deck Link" button in the alert email 404'd.
 */
const TRACKING_SUFFIX =
  "/1/0100019fba91057e-6480ea29-7e32-44fd-ab1d-d16ed76a5edd-000000/_TPhU49gf8CxmEB1zm9takhVUfs=473";

describe("links mangled by email click tracking still work", () => {
  it("/deck-admin accepts a key with the tracking path appended", async () => {
    const html = renderToStaticMarkup(
      await DeckAdminPage(params({ key: `${SECRET}${TRACKING_SUFFIX}`, preset: "1h" })),
    );
    expect(html).toContain(esc(t("en", "da_link_label")));
  });

  it("/deck accepts a token with the tracking path appended", async () => {
    const token = mintDeckToken(Date.now() + ONE_HOUR_MS, SECRET);
    const html = renderToStaticMarkup(await DeckPage(params({ token: token + TRACKING_SUFFIX })));
    expect(html).toContain('class="mb-deck-pages"');
  });

  it("a genuinely wrong key is still a 404, suffix or not", async () => {
    await expect(
      DeckAdminPage(params({ key: `not-the-secret${TRACKING_SUFFIX}` })),
    ).rejects.toThrow();
  });
});

describe("/deck viewer page (F-016)", () => {
  it("renders the pdfjs canvas viewer for a valid token (no native PDF embed, no download UI)", async () => {
    const token = mintDeckToken(Date.now() + ONE_HOUR_MS, SECRET);
    const html = renderToStaticMarkup(await DeckPage(params({ token })));
    expect(html).toContain('class="mb-deck-pages"');
    expect(html).toContain(esc(t("en", "deck_loading")));
    // Canvas rendering only — never an <embed>/<iframe>/<object> PDF with browser chrome.
    expect(html).not.toMatch(/<(embed|iframe|object)\b/);
    expect(html).not.toContain("download");
  });

  it("shows the bilingual expired page linking /investors for an expired token", async () => {
    const token = mintDeckToken(Date.now() - 1000, SECRET);
    const html = renderToStaticMarkup(await DeckPage(params({ token })));
    expect(html).toContain(esc(t("en", "deck_expired_h")));
    expect(html).toContain('href="/investors"');
    expect(html).toContain(esc(t("en", "deck_expired_cta")));
    // The expired copy exists in both languages (bilingual page via the site toggle).
    expect(t("id", "deck_expired_h")).not.toBe(t("en", "deck_expired_h"));
    expect(html).not.toContain('class="mb-deck-pages"');
  });

  it("rejects missing and tampered tokens with the invalid-link page", async () => {
    for (const query of [{}, { token: "garbage" }, { token: mintDeckToken(null, "other") }]) {
      const html = renderToStaticMarkup(await DeckPage(params(query as Record<string, string>)));
      expect(html).toContain(esc(t("en", "deck_invalid_h")));
      expect(html).toContain('href="/investors"');
      expect(html).not.toContain('class="mb-deck-pages"');
    }
  });
});

describe("/deck-admin (F-016)", () => {
  it("404s with a wrong or missing key, or when DECK_SECRET is unset", async () => {
    await expect(DeckAdminPage(params({}))).rejects.toThrow();
    await expect(DeckAdminPage(params({ key: "wrong" }))).rejects.toThrow();
    vi.stubEnv("DECK_SECRET", "");
    await expect(DeckAdminPage(params({ key: SECRET }))).rejects.toThrow();
  });

  it("preset=1h auto-generates a one-hour link with expiry and copy button", async () => {
    const html = renderToStaticMarkup(await DeckAdminPage(params({ key: SECRET, preset: "1h" })));
    expect(html).toContain("https://mobeeli.com/deck?token=");
    expect(html).toContain(esc(t("en", "da_expires").replace("{t}", "")).trimEnd().slice(0, 8));
    expect(html).toContain(esc(t("en", "da_copy")));
    // The minted link verifies and expires about an hour out.
    const token = decodeURIComponent(/deck\?token=([A-Za-z0-9_\-.%]+)/.exec(html)![1]);
    const verdict = verifyDeckToken(token, SECRET);
    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.expiresAtMs).toBeGreaterThan(Date.now());
      expect(verdict.expiresAtMs).toBeLessThanOrEqual(Date.now() + ONE_HOUR_MS);
    }
  });

  it("preset=never auto-generates a non-expiring link labelled 'Never expires'", async () => {
    const html = renderToStaticMarkup(
      await DeckAdminPage(params({ key: SECRET, preset: "never" })),
    );
    expect(html).toContain(esc(t("en", "da_never")));
    const token = decodeURIComponent(/deck\?token=([A-Za-z0-9_\-.%]+)/.exec(html)![1]);
    expect(verifyDeckToken(token, SECRET)).toEqual({ ok: true, expiresAtMs: null });
  });

  it("custom hours input mints an N-hour link; no preset/hours shows only the form", async () => {
    const html = renderToStaticMarkup(await DeckAdminPage(params({ key: SECRET, hours: "5" })));
    const token = decodeURIComponent(/deck\?token=([A-Za-z0-9_\-.%]+)/.exec(html)![1]);
    const verdict = verifyDeckToken(token, SECRET);
    expect(verdict.ok && verdict.expiresAtMs).toBeGreaterThan(Date.now() + 4.9 * ONE_HOUR_MS);

    const formOnly = renderToStaticMarkup(await DeckAdminPage(params({ key: SECRET })));
    expect(formOnly).not.toContain("/deck?token=");
    expect(formOnly).toContain(esc(t("en", "da_hours_label")));
    expect(formOnly).toContain('name="hours"');
  });
});

describe("deck admin model (F-016)", () => {
  const NOW = 1_800_000_000_000;

  it("authorizes only an exact key match against a configured secret", () => {
    expect(deckAdminAuthorized(SECRET, SECRET)).toBe(true);
    expect(deckAdminAuthorized("wrong", SECRET)).toBe(false);
    expect(deckAdminAuthorized(undefined, SECRET)).toBe(false);
    expect(deckAdminAuthorized("", SECRET)).toBe(false);
    expect(deckAdminAuthorized(SECRET, null)).toBe(false);
  });

  it("parses custom hours: positive finite numbers only, capped at a year", () => {
    expect(parseCustomHours("5")).toBe(5);
    expect(parseCustomHours("0.5")).toBe(0.5);
    expect(parseCustomHours(String(MAX_CUSTOM_HOURS * 2))).toBe(MAX_CUSTOM_HOURS);
    for (const bad of [undefined, "", "  ", "0", "-3", "abc", "Infinity", "NaN"]) {
      expect(parseCustomHours(bad)).toBeNull();
    }
  });

  it("resolves presets and custom hours to mints; anything else mints nothing", () => {
    expect(resolveDeckMint({ preset: "1h" }, SECRET, NOW)?.expiresAtMs).toBe(NOW + ONE_HOUR_MS);
    expect(resolveDeckMint({ preset: "never" }, SECRET, NOW)?.expiresAtMs).toBeNull();
    expect(resolveDeckMint({ hours: "2" }, SECRET, NOW)?.expiresAtMs).toBe(NOW + 2 * ONE_HOUR_MS);
    expect(resolveDeckMint({}, SECRET, NOW)).toBeNull();
    expect(resolveDeckMint({ preset: "2h" }, SECRET, NOW)).toBeNull();
    expect(resolveDeckMint({ hours: "-1" }, SECRET, NOW)).toBeNull();
  });
});

describe("deck request form on /investors (F-016)", () => {
  it("renders the bilingual form fields: name/firm/email required, LinkedIn + message optional, honeypot", () => {
    const html = renderToStaticMarkup(<DeckRequestForm />);
    for (const key of [
      "inv_f_name",
      "inv_f_firm",
      "inv_f_email",
      "inv_f_linkedin",
      "inv_f_message",
      "inv_f_send",
    ] as const) {
      expect(html).toContain(esc(t("en", key)));
      // Every form string exists in Indonesian too.
      expect(t("id", key).trim()).not.toBe("");
    }
    expect(html).toContain('class="mb-deckform-honeypot"');
    expect(html).toContain('name="website"');
  });

  it("success copy confirms a personal follow-up in both languages", () => {
    for (const lang of ["en", "id"] as const) {
      expect(t(lang, "inv_success_p").length).toBeGreaterThan(0);
    }
    expect(t("en", "inv_success_p")).toMatch(/founder .*personally/);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { deckRequestSchema } from "@/lib/deck/schema";
import { deckAdminUrl, deckRequestAlert, notifyDeckRequest } from "@/lib/email/deckRequest";

const SECRET = "s3cret-key";

const request = deckRequestSchema.parse({
  name: "Ada Lovelace",
  firm: "Analytical Capital",
  email: "ada@fund.com",
  linkedin: "https://linkedin.com/in/ada",
  message: "Following SEA commerce infra.",
  lang: "id",
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("deck request alert email (F-016)", () => {
  it("deckAdminUrl points at /deck-admin with only the key — no preset parameter", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(deckAdminUrl(SECRET)).toBe(`https://mobeeli.com/deck-admin?key=${SECRET}`);
  });

  it("carries the requester's details in text and html", () => {
    const { subject, text, html } = deckRequestAlert(request, SECRET);
    expect(subject).toBe("Deck request — Ada Lovelace (Analytical Capital)");
    for (const detail of [
      "Ada Lovelace",
      "Analytical Capital",
      "ada@fund.com",
      "https://linkedin.com/in/ada",
      "Following SEA commerce infra.",
    ]) {
      expect(text).toContain(detail);
      expect(html).toContain(detail);
    }
  });

  it("offers exactly one mint CTA: a 'Generate Deck Link' button to /deck-admin with no preset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { text, html } = deckRequestAlert(request, SECRET);

    // The single prominent button (html) links the bare admin URL — key only.
    expect(html).toContain(`href="https://mobeeli.com/deck-admin?key=${SECRET}"`);
    expect(html).toContain("Generate Deck Link");

    // Exactly one link in the html body besides the details block (no Notion
    // outcome passed here — see the Notion-line tests below).
    expect(html.match(/<a /g)).toHaveLength(1);

    // Plain text carries the same single link, on its own labelled line.
    expect(text).toContain(`Generate Deck Link:\nhttps://mobeeli.com/deck-admin?key=${SECRET}`);
    expect(text.trimEnd().endsWith(`?key=${SECRET}`)).toBe(true);

    // The old preset options are gone from both bodies.
    for (const body of [text, html]) {
      expect(body).not.toContain("preset=");
      expect(body).not.toContain("1-hour");
      expect(body).not.toContain("Non-expiring");
      expect(body).not.toContain("Custom duration");
    }
  });

  it("links the Notion row when the request was logged, keeping the mint CTA last", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { text, html } = deckRequestAlert(request, SECRET, {
      status: "logged",
      url: "https://notion.so/deck-row",
    });

    expect(text).toContain("Notion row: https://notion.so/deck-row");
    expect(html).toContain('<a href="https://notion.so/deck-row">Open the Notion row</a>');
    // Two links now: the Notion row and the single mint CTA, still the last line.
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(text.trimEnd().endsWith(`?key=${SECRET}`)).toBe(true);
  });

  it("says loudly when logging failed, so the email is known to be the only record", () => {
    const { text, html } = deckRequestAlert(request, SECRET, {
      status: "failed",
      reason: "Notion responded 404",
    });
    for (const body of [text, html]) {
      expect(body).toContain("NOT LOGGED TO NOTION");
      expect(body).toContain("Notion responded 404");
    }
    // The failure notice is prose, not a link — the mint CTA stays the only one.
    expect(html.match(/<a /g)).toHaveLength(1);
  });

  it("says nothing about Notion when logging is not configured", () => {
    for (const body of Object.values(deckRequestAlert(request, SECRET, { status: "skipped" }))) {
      expect(body).not.toContain("Notion");
    }
  });

  it("notifyDeckRequest throws when RESEND_API_KEY / WAITLIST_ALERT_TO / DECK_SECRET are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("WAITLIST_ALERT_TO", "");
    vi.stubEnv("DECK_SECRET", "");
    await expect(notifyDeckRequest(request)).rejects.toThrow(/RESEND_API_KEY/);

    vi.stubEnv("RESEND_API_KEY", "re_test");
    await expect(notifyDeckRequest(request)).rejects.toThrow(/WAITLIST_ALERT_TO/);

    vi.stubEnv("WAITLIST_ALERT_TO", "team@mobeeli.com");
    await expect(notifyDeckRequest(request)).rejects.toThrow(/DECK_SECRET/);
  });
});

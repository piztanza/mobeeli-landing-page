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

    // Exactly one link in the html body besides the details block.
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

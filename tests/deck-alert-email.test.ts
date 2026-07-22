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
  it("deckAdminUrl points at /deck-admin with the key and the right preset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(deckAdminUrl(SECRET, "1h")).toBe(
      `https://mobeeli.com/deck-admin?key=${SECRET}&preset=1h`,
    );
    expect(deckAdminUrl(SECRET, "never")).toBe(
      `https://mobeeli.com/deck-admin?key=${SECRET}&preset=never`,
    );
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

  it("offers the three mint options: prominent 1-hour button + non-expiring and custom text links", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { text, html } = deckRequestAlert(request, SECRET);

    // The prominent button (html) links the 1h preset.
    expect(html).toContain(`href="https://mobeeli.com/deck-admin?key=${SECRET}&amp;preset=1h"`);
    expect(html).toContain("Generate 1-hour deck link");

    // Plain text links for all three options, presets included.
    expect(text).toContain("Generate 1-hour deck link:");
    expect(text).toContain(`https://mobeeli.com/deck-admin?key=${SECRET}&preset=1h`);
    expect(text).toContain("Non-expiring link:");
    expect(text).toContain(`https://mobeeli.com/deck-admin?key=${SECRET}&preset=never`);
    // Custom-duration link is the bare admin URL (no preset), on its own line.
    expect(text).toContain(`Custom duration:\nhttps://mobeeli.com/deck-admin?key=${SECRET}`);
    expect(text.trimEnd().endsWith(`?key=${SECRET}`)).toBe(true);
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

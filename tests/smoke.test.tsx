import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/waitlist/route";
import JoinPage from "@/app/join/page";
import LandingPage from "@/app/page";
import { t } from "@/lib/i18n";

describe("app entry points (smoke)", () => {
  it("landing page renders the hero headline from the i18n map", () => {
    const html = renderToStaticMarkup(<LandingPage />);
    expect(html).toContain(t("en", "hero.line1"));
    expect(html).toContain(t("en", "hero.line2"));
    expect(html).toContain('href="/join"');
  });

  it("join page renders its title from the i18n map", () => {
    const html = renderToStaticMarkup(<JoinPage />);
    expect(html).toContain(t("en", "join.title"));
  });

  it("POST /api/waitlist rejects an invalid payload with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/waitlist", { method: "POST", body: "not json" }),
    );
    expect(res.status).toBe(400);
  });

  it("POST /api/waitlist accepts a valid payload shape (501 until F-008 lands)", async () => {
    const res = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "garage", businessName: "Bengkel Maju" }),
      }),
    );
    expect(res.status).toBe(501);
  });
});

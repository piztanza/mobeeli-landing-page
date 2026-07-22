import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

  it("join page renders the brand panel and wizard intro from the i18n map", () => {
    const html = renderToStaticMarkup(<JoinPage />);
    expect(html).toContain(t("en", "jw_left_h"));
    expect(html).toContain(t("en", "jw_introTitle"));
    expect(html).toContain(t("en", "jw_start"));
  });

  it("POST /api/waitlist rejects an invalid payload with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/waitlist", { method: "POST", body: "not json" }),
    );
    expect(res.status).toBe(400);
  });

  it("POST /api/waitlist persists a valid payload and returns 200 (F-008)", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "waitlist-smoke-"));
    vi.stubEnv("WAITLIST_FALLBACK_FILE", path.join(tempDir, "leads.jsonl"));
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("RESEND_API_KEY", "");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await POST(
        new Request("http://localhost/api/waitlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ partnerType: "GARAGE", businessName: "Bengkel Maju" }),
        }),
      );
      expect(res.status).toBe(200);
    } finally {
      errorSpy.mockRestore();
      vi.unstubAllEnvs();
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { t } from "@/lib/i18n";
import { buildWaLink, DEFAULT_WHATSAPP_NUMBER } from "@/lib/waitlist/whatsapp";

describe("wa.me deep-link builder", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the design's default number when NEXT_PUBLIC_WHATSAPP_NUMBER is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    expect(buildWaLink("Toko Jaya", "en")).toMatch(
      new RegExp(`^https://wa\\.me/${DEFAULT_WHATSAPP_NUMBER}\\?text=`),
    );
  });

  it("uses NEXT_PUBLIC_WHATSAPP_NUMBER and strips non-digits", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+62 811-222-333");
    expect(buildWaLink("Toko Jaya", "en")).toMatch(/^https:\/\/wa\.me\/62811222333\?text=/);
  });

  it("prefills the English message with the business name", () => {
    const url = new URL(buildWaLink("Toko Jaya Motor", "en"));
    expect(url.searchParams.get("text")).toBe(
      "Hi Mobeeli, I just joined the Early Adaptor waitlist. Business: Toko Jaya Motor. I'd like to get started.",
    );
  });

  it("prefills the Indonesian message with the business name", () => {
    const url = new URL(buildWaLink("Bengkel Sumber Rejeki", "id"));
    expect(url.searchParams.get("text")).toBe(
      "Halo Mobeeli, saya baru daftar Early Adaptor. Bisnis: Bengkel Sumber Rejeki. Saya ingin mulai.",
    );
  });

  it("falls back to the language-appropriate name when the business name is blank", () => {
    expect(new URL(buildWaLink("  ", "en")).searchParams.get("text")).toContain(
      t("en", "jw_fallback_name"),
    );
    expect(new URL(buildWaLink("", "id")).searchParams.get("text")).toContain(
      t("id", "jw_fallback_name"),
    );
  });

  it("URL-encodes the message", () => {
    const link = buildWaLink("Toko & Bengkel", "en");
    expect(link).toContain("Toko%20%26%20Bengkel");
  });
});

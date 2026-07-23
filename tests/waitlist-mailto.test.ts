import { describe, expect, it } from "vitest";

import { t } from "@/lib/i18n";
import { buildMailtoLink, WAITLIST_MAILTO_ADDRESS } from "@/lib/waitlist/mailto";

describe("success panel mailto builder", () => {
  it("targets the approved info@ address", () => {
    expect(WAITLIST_MAILTO_ADDRESS).toBe("info@mobeeli.com");
    expect(buildMailtoLink("Toko Jaya", "en")).toMatch(/^mailto:info@mobeeli\.com\?subject=/);
  });

  it("prefills the English subject and body with the business name", () => {
    const link = buildMailtoLink("Toko Jaya Motor", "en");
    const params = new URLSearchParams(link.split("?")[1]);
    expect(params.get("subject")).toBe("Early Adopter waitlist — Toko Jaya Motor");
    expect(params.get("body")).toBe(
      "Hi Mobeeli, I just joined the Early Adopter waitlist. Business: Toko Jaya Motor. I'd like to get started.",
    );
  });

  it("prefills the Indonesian subject and body with the business name", () => {
    const link = buildMailtoLink("Bengkel Sumber Rejeki", "id");
    const params = new URLSearchParams(link.split("?")[1]);
    expect(params.get("subject")).toBe("Waitlist Early Adopter — Bengkel Sumber Rejeki");
    expect(params.get("body")).toBe(
      "Halo Mobeeli, saya baru daftar Early Adopter. Bisnis: Bengkel Sumber Rejeki. Saya ingin mulai.",
    );
  });

  it("falls back to the language-appropriate name when the business name is blank", () => {
    const en = new URLSearchParams(buildMailtoLink("  ", "en").split("?")[1]);
    expect(en.get("body")).toContain(t("en", "jw_fallback_name"));
    const id = new URLSearchParams(buildMailtoLink("", "id").split("?")[1]);
    expect(id.get("body")).toContain(t("id", "jw_fallback_name"));
  });

  it("URL-encodes the subject and body", () => {
    const link = buildMailtoLink("Toko & Bengkel", "en");
    expect(link).toContain("Toko%20%26%20Bengkel");
    expect(link).not.toContain(" ");
  });
});

import { describe, expect, it } from "vitest";

import { DEFAULT_LANG, copy, langs, t } from "@/lib/i18n";

describe("i18n copy maps", () => {
  const enKeys = Object.keys(copy.en).sort();

  it("has the identical key set in every language", () => {
    for (const lang of langs) {
      expect(Object.keys(copy[lang]).sort(), `key set for '${lang}'`).toEqual(enKeys);
    }
  });

  it("has no empty strings", () => {
    for (const lang of langs) {
      for (const [key, value] of Object.entries(copy[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe("");
      }
    }
  });

  it("resolves keys per language via t()", () => {
    expect(t("en", "hero.line2")).toBe("verified to fit.");
    expect(t("id", "hero.line2")).toBe("dipastikan cocok.");
  });

  it("defaults to English", () => {
    expect(DEFAULT_LANG).toBe("en");
  });
});

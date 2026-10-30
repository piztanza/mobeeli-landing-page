import { describe, expect, it } from "vitest";

import { formatDecimal, formatSignedPercent } from "@/lib/i18n/format";

/**
 * Locale number formatting for spec values (2026-10-31). The ID map already
 * writes decimals with a comma ("⌀ 54,1 mm" in fit3d_bore_v); values the
 * /solutions explainer computes must follow the same convention instead of
 * leaking the English point into Indonesian.
 */
describe("formatDecimal", () => {
  it("uses the decimal point in English and the comma in Indonesian", () => {
    expect(formatDecimal("en", 114.3)).toBe("114.3");
    expect(formatDecimal("id", 114.3)).toBe("114,3");
  });

  it("prints whole numbers without a trailing decimal", () => {
    expect(formatDecimal("en", 100)).toBe("100");
    expect(formatDecimal("id", 18)).toBe("18");
  });

  it("never groups thousands — a 1,045 mm diameter is a measurement, not a price", () => {
    expect(formatDecimal("en", 1045.5)).toBe("1045.5");
    expect(formatDecimal("id", 1045.5)).toBe("1045,5");
  });
});

describe("formatSignedPercent", () => {
  it("signs the deviation and keeps one decimal", () => {
    expect(formatSignedPercent("en", 0.0712)).toBe("+7.1%");
    expect(formatSignedPercent("id", -0.0129)).toBe("−1,3%");
  });

  it("prints zero unsigned", () => {
    expect(formatSignedPercent("en", 0)).toBe("0.0%");
  });
});

import { describe, expect, it } from "vitest";

import { VEHICLE_DB, asOfLabel, countLabel } from "@/components/solutions/vehicleDbData";

/**
 * The /solutions vehicle-database band's numbers (2026-11-04). The counts are
 * the platform's 29 Oct 2026 snapshot, rounded DOWN to what is safe to publish
 * (research "Fitment database showcase and naming"): duplicate generation and
 * model names mean the raw totals overstate, so "1,000+" and "about 700", never
 * 1,108 or 702.
 */
describe("vehicle database counts", () => {
  it("publishes the rounded snapshot counts, smallest level first", () => {
    expect(VEHICLE_DB.levels.map((l) => countLabel("en", l.count))).toEqual([
      "78",
      "about 700",
      "1,000+",
      "1,800+",
      "1970–2026",
    ]);
  });

  it("writes the same counts in Indonesian, with the Indonesian thousands point", () => {
    expect(VEHICLE_DB.levels.map((l) => countLabel("id", l.count))).toEqual([
      "78",
      "sekitar 700",
      "1.000+",
      "1.800+",
      "1970–2026",
    ]);
  });

  it("dates the counts to the snapshot month in each language", () => {
    expect(asOfLabel("en")).toBe("October 2026");
    expect(asOfLabel("id")).toBe("Oktober 2026");
  });

  // The 2024 Avanza 1.5 G row in the snapshot (W101, 2NR-VE): its wheel and
  // tire values were relabelled ESTIMATED on 2026-10-28, and the card says so.
  it("keeps the sample record's wheel values and their estimated status", () => {
    expect(VEHICLE_DB.sample.year).toBe(2024);
    expect(VEHICLE_DB.sample.wheel).toMatchObject({
      boltCount: 5,
      pcdMm: 100,
      centerBoreMm: 54.1,
      offsetMm: 45,
      rimDiameterIn: 16,
      rimWidthIn: 6,
      status: "estimated",
    });
    expect(VEHICLE_DB.sample.tire).toEqual({ widthMm: 195, aspect: 60, rimIn: 16 });
  });
});

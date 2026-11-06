import { describe, expect, it } from "vitest";

import {
  VEHICLE_DB,
  asOfLabel,
  countLabel,
  diameterChange,
} from "@/components/solutions/vehicleDbData";

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

  // The 2025 Toyota GR86 row in the snapshot (ZN8, FA24D, id 258c5b0a…): its
  // stock rim and tire rows were relabelled UNVERIFIED ("one publisher") on
  // 2026-10-28, and the card says "One source".
  it("keeps the sample record's stock wheel values and their one-source status", () => {
    expect(VEHICLE_DB.sample.year).toBe(2025);
    expect(VEHICLE_DB.sample.engineCc).toBe(2387);
    expect(VEHICLE_DB.sample.wheel).toMatchObject({
      boltCount: 5,
      pcdMm: 100,
      centerBoreMm: 56.1,
      offsetMm: 48,
      rimDiameterIn: 18,
      rimWidthIn: 7.5,
      status: "single",
    });
    expect(VEHICLE_DB.sample.tire).toEqual({ widthMm: 215, aspect: 40, rimIn: 18 });
  });

  // The founder's example upgrade (2026-11-06): 18 × 8.5J ET 45, 245/35 R18.
  it("holds the upgrade wheel and tire beside the stock ones", () => {
    expect(VEHICLE_DB.sample.upgrade.wheel).toMatchObject({
      boltCount: 5,
      pcdMm: 100,
      centerBoreMm: 56.1,
      offsetMm: 45,
      rimDiameterIn: 18,
      rimWidthIn: 8.5,
    });
    expect(VEHICLE_DB.sample.upgrade.tire).toEqual({ widthMm: 245, aspect: 35, rimIn: 18 });
  });

  it("works out the overall diameters and the change, in each language", () => {
    expect(diameterChange("en")).toEqual({
      stock: "629.2 mm",
      upgrade: "628.7 mm",
      change: "−0.5 mm (−0.08%)",
    });
    expect(diameterChange("id")).toEqual({
      stock: "629,2 mm",
      upgrade: "628,7 mm",
      change: "−0,5 mm (−0,08%)",
    });
  });
});

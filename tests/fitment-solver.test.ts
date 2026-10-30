import { describe, expect, it } from "vitest";

import {
  OD_TOLERANCE,
  checkPart,
  overallDiameterMm,
  type TireSpec,
  type VehicleFitment,
  type WheelSpec,
} from "@/components/solutions/fitmentSolver";

/**
 * The fitment solver behind the /solutions explainer — PURE (no React, no DOM),
 * so the verdicts the figure shows are computed, never hand-typed. These tests
 * pin the rules on synthetic inputs; the demo catalogue's invariants are pinned
 * separately in fitment-flow.test.tsx.
 */

/** A generic 5 × 114.3 car on 17-inch OE rims, 215/55 R17 94. */
const car: VehicleFitment = {
  boltCount: 5,
  pcdMm: 114.3,
  centerBoreMm: 66.1,
  offsetMinMm: 35,
  offsetMaxMm: 45,
  rimDiametersIn: [17, 18],
  rimWidthMinIn: 6.5,
  rimWidthMaxIn: 8,
  oeTire: { widthMm: 215, aspect: 55, rimIn: 17 },
  oeLoadIndex: 94,
};

const wheel: WheelSpec = {
  kind: "wheel",
  diameterIn: 18,
  widthIn: 7.5,
  offsetMm: 40,
  boltCount: 5,
  pcdMm: 114.3,
  centerBoreMm: 66.1,
};

const tire: TireSpec = {
  kind: "tire",
  size: { widthMm: 215, aspect: 55, rimIn: 17 },
  loadIndex: 94,
};

const state = (result: ReturnType<typeof checkPart>, id: string) =>
  result.checks.find((c) => c.id === id)?.state;

describe("overall diameter", () => {
  it("is the rim plus two sidewalls", () => {
    // 17 × 25.4 + 2 × 215 × 0.55 = 431.8 + 236.5
    expect(overallDiameterMm({ widthMm: 215, aspect: 55, rimIn: 17 })).toBeCloseTo(668.3, 1);
  });

  it("allows the plus-sizing window of ±3%", () => {
    expect(OD_TOLERANCE).toBe(0.03);
  });
});

describe("wheel checks", () => {
  it("fits when every dimension is inside the car's window", () => {
    const r = checkPart(car, wheel);
    expect(r.fits).toBe(true);
    expect(r.checks.map((c) => c.id)).toEqual(["pcd", "bore", "offset", "rim"]);
    expect(r.checks.every((c) => c.state === "pass")).toBe(true);
  });

  it("rejects another bolt count", () => {
    const r = checkPart(car, { ...wheel, boltCount: 4, pcdMm: 100 });
    expect(r.fits).toBe(false);
    expect(state(r, "pcd")).toBe("fail");
  });

  it("rejects the same bolt count on another circle (5 × 112 is not 5 × 114.3)", () => {
    const r = checkPart(car, { ...wheel, pcdMm: 112 });
    expect(r.fits).toBe(false);
    expect(state(r, "pcd")).toBe("fail");
  });

  it("fits a larger centre bore with a hub ring, never a smaller one", () => {
    expect(state(checkPart(car, { ...wheel, centerBoreMm: 73.1 }), "bore")).toBe("ring");
    expect(checkPart(car, { ...wheel, centerBoreMm: 73.1 }).fits).toBe(true);
    const small = checkPart(car, { ...wheel, centerBoreMm: 60.1 });
    expect(state(small, "bore")).toBe("fail");
    expect(small.fits).toBe(false);
  });

  it("holds the offset window inclusive at both edges", () => {
    expect(state(checkPart(car, { ...wheel, offsetMm: 35 }), "offset")).toBe("pass");
    expect(state(checkPart(car, { ...wheel, offsetMm: 45 }), "offset")).toBe("pass");
    expect(state(checkPart(car, { ...wheel, offsetMm: 34 }), "offset")).toBe("fail");
    expect(state(checkPart(car, { ...wheel, offsetMm: 46 }), "offset")).toBe("fail");
  });

  it("rejects a rim diameter or width the car does not take", () => {
    expect(state(checkPart(car, { ...wheel, diameterIn: 20 }), "rim")).toBe("fail");
    expect(state(checkPart(car, { ...wheel, widthIn: 9 }), "rim")).toBe("fail");
  });
});

describe("tire checks", () => {
  it("fits the OE size", () => {
    const r = checkPart(car, tire);
    expect(r.fits).toBe(true);
    expect(r.checks.map((c) => c.id)).toEqual(["rim", "diameter", "load"]);
  });

  it("fits a plus-size that stays inside the diameter window", () => {
    // 225/45 R18 = 659.7 mm against 668.3 mm: -1.3%
    const r = checkPart(car, { ...tire, size: { widthMm: 225, aspect: 45, rimIn: 18 } });
    expect(r.fits).toBe(true);
    const d = r.checks.find((c) => c.id === "diameter");
    expect(d?.deviation).toBeCloseTo(-0.0129, 3);
  });

  it("rejects a size that grows the overall diameter past the window", () => {
    // 235/55 R18 = 715.7 mm: +7.1%
    const r = checkPart(car, { ...tire, size: { widthMm: 235, aspect: 55, rimIn: 18 } });
    expect(r.fits).toBe(false);
    expect(state(r, "diameter")).toBe("fail");
  });

  it("rejects a load index below the OE rating", () => {
    const r = checkPart(car, { ...tire, loadIndex: 91 });
    expect(r.fits).toBe(false);
    expect(state(r, "load")).toBe("fail");
  });

  it("rejects a tire for a rim size the car does not take", () => {
    const r = checkPart(car, { ...tire, size: { widthMm: 185, aspect: 55, rimIn: 16 } });
    expect(state(r, "rim")).toBe("fail");
    expect(r.fits).toBe(false);
  });

  // No Indonesian source publishes OE load indexes (research, 2026-10-31), so
  // a car may carry none. An unknown rating is never guessed into a pass: the
  // check is omitted when the car has no rating on record…
  it("omits the load check when the car's OE load index is not on record", () => {
    const r = checkPart({ ...car, oeLoadIndex: undefined }, tire);
    expect(r.checks.map((c) => c.id)).toEqual(["rim", "diameter"]);
    expect(r.fits).toBe(true);
  });

  // …and a tire that states no rating cannot pass a car that has one.
  it("fails a tire with no load index against a car whose rating is on record", () => {
    const r = checkPart(car, { ...tire, loadIndex: undefined });
    expect(state(r, "load")).toBe("fail");
    expect(r.fits).toBe(false);
  });
});

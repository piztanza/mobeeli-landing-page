import { describe, expect, it } from "vitest";

import {
  ARC_DOT_SPEED,
  ARC_STATIC_POINT,
  CITIES,
  DRIFT_EDGE,
  DRIFT_STEP,
  ENTRY_IDLE_MS,
  HOME_PAN_X,
  HOME_PAN_Z,
  IDLE_RESUME_MS,
  ISLANDS,
  JAKARTA,
  LABEL_REVEAL_S,
  LAND_HI_THRESHOLD,
  LAT_CENTER,
  LON_CENTER,
  MAP_SCALE,
  MAX_PIXEL_RATIO,
  PAN_X_MAX,
  PAN_X_MIN,
  PAN_Z_MAX,
  PAN_Z_MIN,
  buildLandDots,
  buildOceanDots,
  clampPanX,
  clampPanZ,
  driftStep,
  getJakartaLabel,
  hash,
  inPoly,
  isLand,
  project,
  ringPulse,
} from "@/components/three/indoMap";
import { langs, t } from "@/lib/i18n";

describe("point-in-polygon land fill (F-006)", () => {
  const square: readonly (readonly [number, number])[] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];

  it("ray-casts inside/outside a simple ring", () => {
    expect(inPoly(5, 5, square)).toBe(true);
    expect(inPoly(15, 5, square)).toBe(false);
    expect(inPoly(-1, 5, square)).toBe(false);
    expect(inPoly(5, 11, square)).toBe(false);
  });

  it("places Jakarta on land and the Java Sea in the ocean", () => {
    expect(isLand(JAKARTA[0], JAKARTA[1])).toBe(true); // Jakarta, on Java
    expect(isLand(105, -4)).toBe(false); // open water between Sumatra and Java
    expect(isLand(150, 10)).toBe(false); // far outside the archipelago
  });

  it("keeps the design's ten island outlines and six arc cities", () => {
    expect(ISLANDS).toHaveLength(10);
    expect(CITIES).toHaveLength(6);
    expect(JAKARTA).toEqual([106.8, -6.2]);
  });

  it("builds two-tone land layers whose every dot lies on an island", () => {
    const { land, landHi } = buildLandDots();
    // flat xyz arrays, both layers populated
    expect(land.length % 3).toBe(0);
    expect(landHi.length % 3).toBe(0);
    expect(land.length).toBeGreaterThan(0);
    expect(landHi.length).toBeGreaterThan(0);
    // the 0.82 hash threshold makes the highlight layer the sparse one
    expect(landHi.length).toBeLessThan(land.length);
    for (const arr of [land, landHi]) {
      for (let i = 0; i < arr.length; i += 3) {
        // pseudo-elevation stays in the design's 0.02–0.09 band
        expect(arr[i + 1]).toBeGreaterThanOrEqual(0.02);
        expect(arr[i + 1]).toBeLessThanOrEqual(0.09);
        // invert the projection: every dot must sit on an island
        const lon = arr[i] / MAP_SCALE + LON_CENTER;
        const lat = LAT_CENTER - arr[i + 2] / MAP_SCALE;
        expect(isLand(lon, lat)).toBe(true);
      }
    }
    expect(LAND_HI_THRESHOLD).toBe(0.82);
  });

  it("builds the 1° jittered ocean grid on the ground plane", () => {
    const ocean = buildOceanDots();
    expect(ocean.length % 3).toBe(0);
    // 45 lat rows × 81 lon columns
    expect(ocean.length / 3).toBe(45 * 81);
    for (let i = 1; i < ocean.length; i += 3) expect(ocean[i]).toBe(0);
  });

  it("hashes deterministically into [0, 1)", () => {
    expect(hash(106.8, -6.2)).toBe(hash(106.8, -6.2));
    for (const [a, b] of [
      [0, 0],
      [106.8, -6.2],
      [120.4, -1],
      [78, 26],
    ]) {
      const v = hash(a, b);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("projects lon/lat around the archipelago center at the design scale", () => {
    const [cx, cy, cz] = project(LON_CENTER, LAT_CENTER);
    expect(cx).toBe(0);
    expect(cy).toBe(0);
    expect(cz).toBeCloseTo(0, 12); // -0 from the flipped z axis
    const [x, y, z] = project(JAKARTA[0], JAKARTA[1], 0.03);
    expect(x).toBeCloseTo((106.8 - 117.75) * MAP_SCALE, 10);
    expect(y).toBe(0.03);
    expect(z).toBeCloseTo(-(-6.2 - -2.05) * MAP_SCALE, 10);
  });
});

describe("camera rig math (F-006)", () => {
  it("keeps the design's pan clamps, home pan and idle timings", () => {
    expect([PAN_X_MIN, PAN_X_MAX]).toEqual([-3.9, 3.9]);
    expect([PAN_Z_MIN, PAN_Z_MAX]).toEqual([-0.7, 1.5]);
    expect([HOME_PAN_X, HOME_PAN_Z]).toEqual([-1.4, 0.2]);
    expect(IDLE_RESUME_MS).toBe(3000);
    expect(ENTRY_IDLE_MS).toBe(2200);
    expect(LABEL_REVEAL_S).toBe(0.8);
    expect(MAX_PIXEL_RATIO).toBe(2);
  });

  it("clamps drag panning to the map bounds", () => {
    expect(clampPanX(-10)).toBe(PAN_X_MIN);
    expect(clampPanX(10)).toBe(PAN_X_MAX);
    expect(clampPanX(1.2)).toBe(1.2);
    expect(clampPanZ(-10)).toBe(PAN_Z_MIN);
    expect(clampPanZ(10)).toBe(PAN_Z_MAX);
    expect(clampPanZ(0.4)).toBe(0.4);
  });

  it("drifts west↔east and reverses at the bounds", () => {
    // mid-map: keeps drifting east
    expect(driftStep(0, 0, 1)).toEqual({ drift: DRIFT_STEP, dir: 1 });
    // past the east bound: direction flips west
    expect(driftStep(0, DRIFT_EDGE, 1).dir).toBe(-1);
    // past the west bound: direction flips east
    expect(driftStep(0, -DRIFT_EDGE, -1).dir).toBe(1);
  });

  it("pulses the Jakarta ring, steadying it when static", () => {
    expect(ringPulse(1.7, true)).toEqual({ scale: 1, opacity: 0.5 });
    // sin(t·2.2) = 1 → full pulse: scale 2.1, opacity 0.375
    const peak = ringPulse(Math.PI / 2 / 2.2, false);
    expect(peak.scale).toBeCloseTo(2.1, 10);
    expect(peak.opacity).toBeCloseTo(0.375, 10);
    // sin(t·2.2) = -1 → rest: scale 1, opacity 0.75
    const rest = ringPulse((3 * Math.PI) / 2 / 2.2, false);
    expect(rest.scale).toBeCloseTo(1, 10);
    expect(rest.opacity).toBeCloseTo(0.75, 10);
  });

  it("sweeps arc dots at the design rate and freezes them mid-arc when static", () => {
    expect(ARC_DOT_SPEED).toBe(0.13);
    expect(ARC_STATIC_POINT).toBe(0.5);
  });
});

describe("Jakarta label translation (F-006)", () => {
  it("translates the marker note with the language", () => {
    expect(getJakartaLabel("en")).toEqual({ city: "Jakarta", note: "— first market, 2026" });
    expect(getJakartaLabel("id")).toEqual({ city: "Jakarta", note: "— pasar pertama, 2026" });
  });

  it("sources the label strings from the i18n copy maps", () => {
    for (const lang of langs) {
      const label = getJakartaLabel(lang);
      expect(label.city).toBe(t(lang, "indo_city"));
      expect(label.note).toBe(t(lang, "indo_note"));
    }
  });
});

import { describe, expect, it } from "vitest";

import { FITMENT_LABEL_ANCHORS, getFitmentLabels } from "@/components/three/fitmentLabels";
import {
  BOLT_FAR_Z,
  BOLT_SEAT_Z,
  ENTRANCE_S,
  LABEL_REVEAL_S,
  LOOP_S,
  MAX_PIXEL_RATIO,
  WHEEL_FAR_Z,
  WHEEL_SEAT_Z,
  boltPose,
  entrancePose,
  loopTime,
  ringPulse,
  wheelPose,
} from "@/components/three/fitmentTimeline";
import { langs, t } from "@/lib/i18n";

describe("fitment scene labels (F-002)", () => {
  it("has the approved label set per language, verbatim from the design", () => {
    const en = getFitmentLabels("en");
    expect(en.map((l) => [l.title, l.value])).toEqual([
      ["Bolt pattern · PCD", "4 × 100"],
      ["Center bore", "⌀ 54.1 mm"],
      ["Authenticity", "Genuine"],
    ]);
    const id = getFitmentLabels("id");
    expect(id.map((l) => [l.title, l.value])).toEqual([
      ["Pola baut · PCD", "4 × 100"],
      ["Lubang tengah", "⌀ 54,1 mm"],
      ["Keaslian", "Asli"],
    ]);
  });

  it("sources every label string from the i18n copy maps", () => {
    for (const lang of langs) {
      const [pcd, bore, auth] = getFitmentLabels(lang);
      expect(pcd.title).toBe(t(lang, "fit3d_pcd_t"));
      expect(pcd.value).toBe(t(lang, "fit3d_pcd_v"));
      expect(bore.title).toBe(t(lang, "fit3d_bore_t"));
      expect(bore.value).toBe(t(lang, "fit3d_bore_v"));
      expect(auth.title).toBe(t(lang, "fit3d_auth_t"));
      expect(auth.value).toBe(t(lang, "fit3d_auth_v"));
    }
  });

  it("anchors match the design's 3D points and are shared across languages", () => {
    expect(FITMENT_LABEL_ANCHORS).toEqual([
      [0.55, 0.75, 0.4],
      [0, 0, 0.4],
      [1.5, -1.35, 0.2],
    ]);
    for (const lang of langs) {
      expect(getFitmentLabels(lang).map((l) => l.anchor)).toEqual([...FITMENT_LABEL_ANCHORS]);
    }
  });
});

describe("fitment timeline phase math (F-002)", () => {
  it("keeps the design's ~7s loop after a 1s entrance, labels after the first full loop", () => {
    expect(ENTRANCE_S).toBe(1.0);
    expect(LOOP_S).toBe(7.0);
    expect(LABEL_REVEAL_S).toBe(7.2);
    expect(LABEL_REVEAL_S).toBeGreaterThan(LOOP_S);
    expect(MAX_PIXEL_RATIO).toBe(2);
  });

  it("maps elapsed time to loop time (-1 during the entrance)", () => {
    expect(loopTime(0.5)).toBe(-1);
    expect(loopTime(1.0)).toBe(-1);
    expect(loopTime(3.5)).toBeCloseTo(2.5, 10);
    expect(loopTime(8.1)).toBeCloseTo(0.1, 10); // wrapped into the second loop
  });

  it("wheel z: far → eased travel → seated → dismount, at the design timestamps", () => {
    expect(wheelPose(-1)).toEqual({ z: WHEEL_FAR_Z, rot: -0.35 }); // pre-entrance
    expect(wheelPose(0.3)).toEqual({ z: WHEEL_FAR_Z, rot: -0.35 }); // hold
    // mid-travel (tl=1.3 → p=0.5, easeOut=0.875)
    expect(wheelPose(1.3).z).toBeCloseTo(WHEEL_FAR_Z + (WHEEL_SEAT_Z - WHEEL_FAR_Z) * 0.875, 10);
    expect(wheelPose(1.3).rot).toBeCloseTo(-0.35 * 0.125, 10);
    // seated from the end of travel until dismount starts
    expect(wheelPose(2.2).z).toBeCloseTo(WHEEL_SEAT_Z, 10);
    expect(wheelPose(2.2).rot).toBeCloseTo(0, 10);
    expect(wheelPose(5.6).z).toBeCloseTo(WHEEL_SEAT_Z, 10);
    // fully dismounted one second later
    expect(wheelPose(6.6).z).toBeCloseTo(WHEEL_FAR_Z, 10);
    expect(wheelPose(6.6).rot).toBeCloseTo(-0.2, 10);
  });

  it("bolt z: staggered streak-in, seat with spin, unbolt off-screen", () => {
    // bolt 0 enters at 0.9s, bolt 3 at 1.26s
    expect(boltPose(0.89, 0)).toEqual({ z: BOLT_FAR_Z, visible: false, spinning: false });
    expect(boltPose(1.0, 3).visible).toBe(false);
    expect(boltPose(1.3, 3).visible).toBe(true);
    // spinning while streaking in, seated (no spin) once travel completes
    expect(boltPose(1.5, 0).spinning).toBe(true);
    const seated = boltPose(2.8, 0); // 0.9 + 1.9s travel
    expect(seated.z).toBeCloseTo(BOLT_SEAT_Z, 10);
    expect(seated.spinning).toBe(false);
    expect(seated.visible).toBe(true);
    // dismount: bolt 0 leaves at 5.2s, is fully far by 5.9s, hidden after 5.95s
    expect(boltPose(5.9, 0).z).toBeCloseTo(BOLT_FAR_Z, 10);
    expect(boltPose(5.9, 0).visible).toBe(true);
    expect(boltPose(5.96, 0).visible).toBe(false);
  });

  it("flash ring pulses only in the 3.2–3.75s window after seating", () => {
    expect(ringPulse(3.2)).toEqual({ opacity: 0, scale: 1 });
    const mid = ringPulse(3.475); // u = 0.5
    expect(mid.opacity).toBeCloseTo(0.425, 10);
    expect(mid.scale).toBeCloseTo(1.275, 10);
    expect(ringPulse(3.8)).toEqual({ opacity: 0, scale: 1 });
  });

  it("entrance eases the scene in from ~0 to full scale", () => {
    expect(entrancePose(0).scale).toBe(0.001);
    expect(entrancePose(2).scale).toBeCloseTo(1, 2);
    // at t=2 the ease has all but settled (1 - 2^-10) into the idle sway
    const ease = 1 - Math.pow(2, -10);
    expect(entrancePose(2).rotY).toBeCloseTo(
      Math.PI * (1 - ease) * 0.25 + 0.14 + 0.04 * Math.sin(0.8),
      10,
    );
  });
});

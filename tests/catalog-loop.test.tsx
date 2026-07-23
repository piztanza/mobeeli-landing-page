import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import AiCatalogCard from "@/components/landing/AiCatalogCard";
import {
  ASSEMBLE_AT_MS,
  BLOOM_AT_MS,
  buildTimeline,
  createLoopScheduler,
  ENTER_OFFSETS,
  FADE_AT_MS,
  NAME_CHIP_DELAY_MS,
  NAME_FADE_TO_ORBIT_MS,
  NAME_LINGER_MS,
  ORBIT_R0_FACTOR,
  ORBIT_R1_FACTOR,
  ORBIT_SPIN_DUR_MS,
  ORBIT_SPIN_START_MS,
  ORBIT_SWEEP_RAD,
  orbitEase,
  orbitPos,
  orbitRadii,
  POP_EASE,
  POP_START_MS,
  POP_STAGGER_MS,
  RESTART_AFTER_FADE_MS,
  SELF_SPIN_DEG,
  SELF_SPIN_STAGGER_DEG,
  transformOf,
  type OrbitGeometry,
} from "@/components/landing/catalogLoop";
import { copy, langs, t } from "@/lib/i18n";

describe("catalog loop phase scheduler timings (F-005)", () => {
  it("keeps the design's phase constants", () => {
    // pop-in: first sprite at 380ms, one every 560ms, spring ease
    expect(POP_START_MS).toBe(380);
    expect(POP_STAGGER_MS).toBe(560);
    expect(POP_EASE).toBe("cubic-bezier(.2,1.4,.35,1)");
    expect(NAME_CHIP_DELAY_MS).toBe(230);
    expect(NAME_LINGER_MS).toBe(450);
    expect(NAME_FADE_TO_ORBIT_MS).toBe(250);
    // orbit shrink pass: starts 880ms after the glide, runs ~1.3s
    expect(ORBIT_SPIN_START_MS).toBe(880);
    expect(ORBIT_SPIN_DUR_MS).toBe(1300);
    // bloom → assemble → fade → restart offsets from the glide
    expect(BLOOM_AT_MS).toBe(2230);
    expect(ASSEMBLE_AT_MS).toBe(3150);
    expect(FADE_AT_MS).toBe(5650);
    expect(RESTART_AFTER_FADE_MS).toBe(850);
  });

  it("reproduces the design's absolute schedule for the full six-sprite stage", () => {
    const tl = buildTimeline(6);
    expect(tl.popStart(0)).toBe(380);
    expect(tl.popStart(5)).toBe(380 + 5 * 560);
    expect(tl.namesFadeAt).toBe(380 + 6 * 560 + 450); // design's tB
    expect(tl.orbitGlideAt).toBe(tl.namesFadeAt + 250); // design's tC
    expect(tl.orbitSpinAt).toBe(tl.orbitGlideAt + 880);
    expect(tl.bloomAt).toBe(tl.orbitGlideAt + 2230);
    expect(tl.assembleAt).toBe(tl.orbitGlideAt + 3150);
    expect(tl.fadeAt).toBe(tl.orbitGlideAt + 5650);
    expect(tl.restartAt).toBe(tl.orbitGlideAt + 6500);
  });

  it("orders the phases strictly for the shipped five-sprite stage", () => {
    const tl = buildTimeline(5);
    const lastPop = tl.popStart(4);
    expect(lastPop).toBeLessThan(tl.namesFadeAt);
    const order = [
      tl.namesFadeAt,
      tl.orbitGlideAt,
      tl.orbitSpinAt,
      tl.bloomAt,
      tl.assembleAt,
      tl.fadeAt,
      tl.restartAt,
    ];
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `phase ${i} after phase ${i - 1}`).toBeGreaterThan(order[i - 1]);
    }
    // the orbit shrink pass finishes before the bloom takes over
    expect(tl.orbitSpinAt + ORBIT_SPIN_DUR_MS).toBeLessThanOrEqual(tl.bloomAt + 50);
  });

  it("has a scattered entry offset for every design slot", () => {
    expect(ENTER_OFFSETS).toHaveLength(6);
    expect(transformOf(ENTER_OFFSETS[0], 0.55)).toBe(
      "translate(-70px,-20px) rotate(-14deg) scale(0.55)",
    );
    expect(transformOf(ENTER_OFFSETS[5])).toBe("translate(90px,50px) rotate(14deg)");
  });
});

describe("catalog loop orbit math (F-005)", () => {
  const geo: OrbitGeometry = {
    cx: 280,
    cy: 180,
    ...orbitRadii(560, 360),
    hx: [100, 200, 300, 400, 500],
    hy: [50, 100, 150, 200, 250],
  };

  it("shrinks the orbit from r0 = 0.36·m to r1 = 0.12·m", () => {
    expect(ORBIT_R0_FACTOR).toBe(0.36);
    expect(ORBIT_R1_FACTOR).toBe(0.12);
    // m = min(560, 360) = 360
    expect(geo.r0).toBeCloseTo(360 * 0.36);
    expect(geo.r1).toBeCloseTo(360 * 0.12);
  });

  it("eases the shrink quadratically in-out", () => {
    expect(orbitEase(0)).toBe(0);
    expect(orbitEase(0.5)).toBeCloseTo(0.5);
    expect(orbitEase(1)).toBe(1);
    expect(orbitEase(0.25)).toBeCloseTo(0.125);
  });

  it("starts each sprite on the wide circle at its evenly spaced slot", () => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const th = (i * 2 * Math.PI) / count;
      const o = orbitPos(i, count, 0, geo);
      expect(o.x).toBeCloseTo(geo.cx + geo.r0 * Math.cos(th) - geo.hx[i]);
      expect(o.y).toBeCloseTo(geo.cy + geo.r0 * Math.sin(th) - geo.hy[i]);
      expect(o.spin).toBe(i * SELF_SPIN_STAGGER_DEG);
    }
  });

  it("ends the pass on the tight circle, swept 3.6rad, spun 330° + 12°·i", () => {
    expect(ORBIT_SWEEP_RAD).toBe(3.6);
    expect(SELF_SPIN_DEG).toBe(330);
    const o = orbitPos(2, 5, 1, geo);
    const th = (2 * 2 * Math.PI) / 5 + ORBIT_SWEEP_RAD;
    expect(o.x).toBeCloseTo(geo.cx + geo.r1 * Math.cos(th) - geo.hx[2]);
    expect(o.y).toBeCloseTo(geo.cy + geo.r1 * Math.sin(th) - geo.hy[2]);
    expect(o.spin).toBe(330 + 2 * 12);
  });
});

describe("catalog loop scheduler (F-005)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires scheduled steps at their offsets, in order", () => {
    vi.useFakeTimers();
    const scheduler = createLoopScheduler();
    const fired: string[] = [];
    scheduler.at(500, () => fired.push("orbit"));
    scheduler.at(100, () => fired.push("pop"));
    vi.advanceTimersByTime(99);
    expect(fired).toEqual([]);
    vi.advanceTimersByTime(500);
    expect(fired).toEqual(["pop", "orbit"]);
  });

  it("clear() cancels every pending step (stop / unmount contract)", () => {
    vi.useFakeTimers();
    const scheduler = createLoopScheduler();
    const fired: string[] = [];
    scheduler.at(100, () => fired.push("pop"));
    scheduler.at(500, () => fired.push("orbit"));
    vi.advanceTimersByTime(150);
    scheduler.clear();
    vi.advanceTimersByTime(10_000);
    expect(fired).toEqual(["pop"]);
  });
});

describe("catalog loop copy (F-005)", () => {
  const KEYS = [
    "scn1",
    "scn2",
    "scn3",
    "scn4",
    "scn5",
    "scn6",
    "cat_pill",
    "cat_ai_read",
    "cat_ai_done",
  ] as const;

  it("has every loop key non-empty in both languages", () => {
    for (const lang of langs) {
      const map = copy[lang] as Record<string, string>;
      for (const key of KEYS) {
        expect(map[key]?.trim(), `${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it("flips the AI chip between distinct reading/assembled states per language", () => {
    for (const lang of langs) {
      expect(t(lang, "cat_ai_read")).not.toBe(t(lang, "cat_ai_done"));
    }
    expect(t("en", "cat_ai_read")).toContain("reading 3 catalogs");
    expect(t("en", "cat_ai_done")).toContain("catalog assembled ✓");
    expect(t("id", "cat_ai_read")).toContain("membaca 3 katalog");
    expect(t("id", "cat_ai_done")).toContain("katalog selesai disusun ✓");
  });
});

describe("AiCatalogCard render (F-005)", () => {
  it("SSR/static markup is the assembled state: done chip, pill, name chips at rest", () => {
    const html = renderToStaticMarkup(<AiCatalogCard static />);
    expect(html).toContain(t("en", "cat_ai_done"));
    expect(html).not.toContain(t("en", "cat_ai_read"));
    expect(html).toContain(t("en", "cat_pill"));
    // every shipped sprite renders its name chip (hidden at rest via CSS)
    for (const key of ["scn1", "scn2", "scn3", "scn4", "scn5", "scn6"] as const) {
      expect(html).toContain(`>${t("en", key)}</span>`);
    }
  });

  it("defaults to the assembled state before the loop starts (no-JS parity)", () => {
    const html = renderToStaticMarkup(<AiCatalogCard />);
    expect(html).toContain(t("en", "cat_ai_done"));
    expect(html).toContain(t("en", "cat_pill"));
  });
});

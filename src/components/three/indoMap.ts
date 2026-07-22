import { t, type Lang } from "@/lib/i18n";

/**
 * Map data + math for the Indonesia flyover map (F-006) — ported VERBATIM
 * from the approved design's indo-globe.js. Pure functions/constants so the
 * dot-matrix fill (point-in-polygon over the island outlines), the map
 * projection and the camera-rig clamps are unit-testable without WebGL.
 */

/** Island outline polygons as [lon, lat] rings (design: ISLANDS) — Sumatra,
 *  Java, Kalimantan, Sulawesi (+ arms), Papua, Nusa Tenggara, Maluku. */
export const ISLANDS: readonly (readonly (readonly [number, number])[])[] = [
  [
    [95, 5.7],
    [97.5, 4.5],
    [100, 0.5],
    [103, -2.5],
    [106, -6],
    [104.5, -6],
    [101, -3],
    [98, 1],
    [95.5, 3.5],
  ],
  [
    [105.5, -6],
    [108, -6.3],
    [111, -6.5],
    [114.5, -7.5],
    [114.5, -8.5],
    [111, -8.2],
    [108, -7.8],
    [105.8, -7],
  ],
  [
    [108.9, 0.2],
    [109.5, 1.8],
    [111.5, 1.2],
    [113, 3.2],
    [115, 4.6],
    [117.4, 3.9],
    [118.9, 1.2],
    [117.5, -0.8],
    [116.3, -3.4],
    [114.5, -4],
    [112.5, -3.3],
    [110.2, -2.9],
    [109, -1.2],
  ],
  [
    [118.8, 0.6],
    [120.2, 1.3],
    [120.8, 0.9],
    [120.4, -1],
    [121.3, -2],
    [122.5, -3],
    [122.2, -4.5],
    [120.9, -5.6],
    [120.2, -5.5],
    [120.4, -3.2],
    [119.6, -2.2],
    [119.4, -0.7],
  ],
  [
    [120.8, 1.2],
    [122.7, 1],
    [124.8, 1.4],
    [125.2, 1.6],
    [124.9, 0.8],
    [122.9, 0.4],
    [121, 0.6],
  ],
  [
    [122.4, -3.2],
    [123.2, -4],
    [123, -5.4],
    [122.3, -4.6],
  ],
  [
    [130.8, -0.9],
    [132.9, -0.4],
    [134.2, -1.4],
    [135.5, -1.5],
    [136.5, -2.2],
    [138, -2.4],
    [140.9, -2.6],
    [141, -8],
    [138.5, -7.3],
    [137, -5],
    [135, -4.3],
    [133.5, -3.5],
    [132.2, -4],
    [131, -2.4],
    [130.3, -1.4],
  ],
  [
    [114.8, -8.2],
    [125, -8.3],
    [125, -9.3],
    [114.8, -9],
  ],
  [
    [127.4, 1.8],
    [128.6, 1.4],
    [128.3, 0.3],
    [127.4, 0.7],
  ],
  [
    [127.9, -3],
    [130.8, -3.2],
    [130.6, -3.9],
    [128, -3.6],
  ],
];

/** Jakarta [lon, lat] (design: JKT). */
export const JAKARTA: readonly [number, number] = [106.8, -6.2];

/** Arc destinations [lon, lat] — Surabaya, Bandung, Semarang, Medan,
 *  Makassar, Balikpapan (design: CITIES). */
export const CITIES: readonly (readonly [number, number])[] = [
  [112.7, -7.25],
  [107.6, -6.9],
  [110.4, -7.0],
  [98.7, 3.6],
  [119.4, -5.1],
  [116.8, -1.25],
];

/** Map projection: degrees → scene units around the archipelago's center
 *  (design: S / LON0 / LAT0). */
export const MAP_SCALE = 0.16;
export const LON_CENTER = 117.75;
export const LAT_CENTER = -2.05;

/** Ray-cast point-in-polygon over a [lon, lat] ring (design: inPoly). */
export function inPoly(x: number, y: number, p: readonly (readonly [number, number])[]): boolean {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if (
      p[i][1] > y !== p[j][1] > y &&
      x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** True when [lon, lat] falls on any island (drives the land-dot fill). */
export function isLand(lon: number, lat: number): boolean {
  return ISLANDS.some((p) => inPoly(lon, lat, p));
}

/** Deterministic 0–1 jitter/elevation hash (design: hash). */
export function hash(a: number, b: number): number {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** Flat-map projection: [lon, lat, elevation] → scene [x, y, z] (design: toM). */
export function project(lon: number, lat: number, y = 0): [number, number, number] {
  return [(lon - LON_CENTER) * MAP_SCALE, y, -(lat - LAT_CENTER) * MAP_SCALE];
}

/** Land-dot lattice bounds + 0.27° step (design: land loop). */
export const LAND_LAT_MIN = -10.8;
export const LAND_LAT_MAX = 6.6;
export const LAND_LON_MIN = 94.2;
export const LAND_LON_MAX = 141.6;
export const LAND_STEP = 0.27;
/** Dots whose hash(lat, lon) exceeds this go to the bright highlight layer. */
export const LAND_HI_THRESHOLD = 0.82;

/** Two-tone land dot layers with pseudo-elevation (design: land / landHi).
 *  Returns flat xyz position arrays for THREE.Float32BufferAttribute. */
export function buildLandDots(): { land: number[]; landHi: number[] } {
  const land: number[] = [];
  const landHi: number[] = [];
  for (let lat = LAND_LAT_MIN; lat <= LAND_LAT_MAX; lat += LAND_STEP) {
    for (let lon = LAND_LON_MIN; lon <= LAND_LON_MAX; lon += LAND_STEP) {
      if (isLand(lon, lat)) {
        const h = 0.02 + hash(lon, lat) * 0.07;
        const [x, y, z] = project(lon, lat, h);
        (hash(lat, lon) > LAND_HI_THRESHOLD ? landHi : land).push(x, y, z);
      }
    }
  }
  return { land, landHi };
}

/** Faint jittered ocean grid, 1° lattice (design: ocean loop). */
export function buildOceanDots(): number[] {
  const ocean: number[] = [];
  for (let lat = -18; lat <= 26; lat += 1.0) {
    for (let lon = 78; lon <= 158; lon += 1.0) {
      const [x, y, z] = project(lon + hash(lon, lat) * 0.3, lat + hash(lat, lon) * 0.3, 0);
      ocean.push(x, y, z);
    }
  }
  return ocean;
}

/* ---- Camera rig (design: pan/drift block) ---- */

/** Drag-pan clamps (design: pointermove Math.max/min bounds). */
export const PAN_X_MIN = -3.9;
export const PAN_X_MAX = 3.9;
export const PAN_Z_MIN = -0.7;
export const PAN_Z_MAX = 1.5;
/** Home pan the camera starts at / re-centers to (design: panX = -1.4, panZ = 0.2). */
export const HOME_PAN_X = -1.4;
export const HOME_PAN_Z = 0.2;
/** Idle west↔east drift: per-frame step, reversal bound (design: drift block). */
export const DRIFT_STEP = 0.0016;
export const DRIFT_EDGE = 2.6;
/** Pointer-delta → pan factors (design: 0.006 / 0.005). */
export const DRAG_X_FACTOR = 0.006;
export const DRAG_Z_FACTOR = 0.005;
/** Drift resumes this long after the last drag (design: idleAt = now + 3000). */
export const IDLE_RESUME_MS = 3000;
/** Re-center hold when the map scrolls into view (design: idleAt = now + 2200). */
export const ENTRY_IDLE_MS = 2200;
/** IntersectionObserver threshold for the re-center-on-entry observer. */
export const ENTRY_THRESHOLD = 0.35;
/** Camera eases toward the pan target at this rate (design: 0.09). */
export const CAM_LERP = 0.09;
/** Arc dots sweep the curve at this rate; static freezes them mid-arc (design: 0.13 / 0.5). */
export const ARC_DOT_SPEED = 0.13;
export const ARC_STATIC_POINT = 0.5;
/** Jakarta label fades in once t passes this (design: t > 0.8). */
export const LABEL_REVEAL_S = 0.8;
/** devicePixelRatio cap (design: Math.min(devicePixelRatio, 2)). */
export const MAX_PIXEL_RATIO = 2;

export const clampPanX = (x: number): number => Math.max(PAN_X_MIN, Math.min(PAN_X_MAX, x));
export const clampPanZ = (z: number): number => Math.max(PAN_Z_MIN, Math.min(PAN_Z_MAX, z));

/**
 * One idle-drift step: advances drift by DRIFT_STEP in the current direction
 * and reverses direction at the ±DRIFT_EDGE bounds (design: tick drift block).
 */
export function driftStep(
  panX: number,
  drift: number,
  dir: 1 | -1,
): { drift: number; dir: 1 | -1 } {
  const next = drift + DRIFT_STEP * dir;
  const edge = panX + next;
  let nextDir = dir;
  if (edge > DRIFT_EDGE) nextDir = -1;
  if (edge < -DRIFT_EDGE) nextDir = 1;
  return { drift: next, dir: nextDir };
}

/** Pulse-ring scale/opacity at t seconds; steady when static (design: ps block). */
export function ringPulse(t: number, isStatic: boolean): { scale: number; opacity: number } {
  if (isStatic) return { scale: 1, opacity: 0.5 };
  const ps = 1 + 1.1 * (0.5 + 0.5 * Math.sin(t * 2.2));
  return { scale: ps, opacity: 0.75 * (1 - (ps - 1) / 2.2) };
}

/** The Jakarta marker label for a language (design: .lbl — <b>Jakarta</b> + note). */
export function getJakartaLabel(lang: Lang): { city: string; note: string } {
  return { city: t(lang, "indo_city"), note: t(lang, "indo_note") };
}

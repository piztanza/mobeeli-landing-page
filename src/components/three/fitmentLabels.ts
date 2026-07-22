import { t, type Lang } from "@/lib/i18n";

/**
 * Projected spec labels for the 3D hero fitment scene (F-002). Text lives in
 * the i18n copy maps (fit3d_* keys, verbatim from the design's LABELS map);
 * anchors are the design's label points in the wheel group's local space —
 * identical across languages.
 */

export interface FitmentLabel {
  /** Stable id — also the React key, so a lang switch never remounts a label. */
  id: "pcd" | "bore" | "auth";
  title: string;
  value: string;
  anchor: readonly [number, number, number];
}

/** Label anchor points in wheel-local space, in render order (design: LABELS[].p). */
export const FITMENT_LABEL_ANCHORS: readonly (readonly [number, number, number])[] = [
  [0.55, 0.75, 0.4], // bolt pattern · PCD
  [0, 0, 0.4], // center bore
  [1.5, -1.35, 0.2], // authenticity
];

/** The label set for a language — PCD, center bore, authenticity. */
export function getFitmentLabels(lang: Lang): FitmentLabel[] {
  return [
    {
      id: "pcd",
      title: t(lang, "fit3d_pcd_t"),
      value: t(lang, "fit3d_pcd_v"),
      anchor: FITMENT_LABEL_ANCHORS[0],
    },
    {
      id: "bore",
      title: t(lang, "fit3d_bore_t"),
      value: t(lang, "fit3d_bore_v"),
      anchor: FITMENT_LABEL_ANCHORS[1],
    },
    {
      id: "auth",
      title: t(lang, "fit3d_auth_t"),
      value: t(lang, "fit3d_auth_v"),
      anchor: FITMENT_LABEL_ANCHORS[2],
    },
  ];
}

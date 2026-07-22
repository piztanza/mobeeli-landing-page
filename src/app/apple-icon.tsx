import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { THEME_COLOR } from "@/lib/seo";

/**
 * Apple touch icon (F-010) — the Mobeeli mark (from public/assets/mobeeli-mark.png)
 * centered on the solid #0d1522 brand surface (iOS composites over the corners).
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const mark = await readFile(path.join(process.cwd(), "public/assets/mobeeli-mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: THEME_COLOR,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori canvas, not the DOM */}
        <img src={markSrc} width={140} height={140} alt="" />
      </div>
    ),
    { ...size },
  );
}

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/** Favicon (F-010) — generated from public/assets/mobeeli-mark.png (1200×1200). */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const mark = await readFile(path.join(process.cwd(), "public/assets/mobeeli-mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- satori canvas, not the DOM */}
        <img src={markSrc} width={32} height={32} alt="" />
      </div>
    ),
    { ...size },
  );
}

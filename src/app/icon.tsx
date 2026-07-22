import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { FAVICON_SIZES } from "@/lib/seo";

/**
 * Favicon (F-010) — generated from public/assets/mobeeli-mark.png (1200×1200)
 * at 48×48 + 192×192 per Google guidelines (CHG-piztanza-07).
 */

export const contentType = "image/png";

export function generateImageMetadata() {
  return FAVICON_SIZES.map((size) => ({
    id: `${size.width}`,
    size: { width: size.width, height: size.height },
    contentType,
  }));
}

export default async function Icon({ id }: { id: string | Promise<string> }) {
  // Next 16 delivers the generateImageMetadata id as a promise.
  const edge = Number(await id);
  const mark = await readFile(path.join(process.cwd(), "public/assets/mobeeli-mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- satori canvas, not the DOM */}
        <img src={markSrc} width={edge} height={edge} alt="" />
      </div>
    ),
    { width: edge, height: edge },
  );
}

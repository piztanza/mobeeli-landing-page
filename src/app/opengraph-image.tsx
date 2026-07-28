import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, THEME_COLOR, ogImageAlt, ogTagline } from "@/lib/seo";

/**
 * Brand OG image (F-010): 1200×630, official dark-bg (white) logo centered on
 * the #0d1522 brand surface with the approved hero tagline. Applies to every
 * route under the root layout; rendered statically at build time.
 */

export const alt = ogImageAlt();
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function OpengraphImage() {
  // Official dark-background logo (white wordmark, 3076×783 — the 2026-07-28 larger-text lockup) inlined as a data URI.
  const logo = await readFile(path.join(process.cwd(), "public/assets/mobeeli-logo-white.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          backgroundColor: THEME_COLOR,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori canvas, not the DOM */}
        <img src={logoSrc} width={620} height={238} alt="" />
        <div style={{ color: "#eaf1ff", fontSize: 44, fontWeight: 600 }}>{ogTagline()}</div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { computeFlowGeometry, FLOW_VIEW } from "@/components/landing/platformFlowGeometry";

describe("platform-flow geometry (R20 2a)", () => {
  const geo = computeFlowGeometry();

  it("converges — ribbon mass at the core is strictly less than at the nodes", () => {
    // THE POINT OF THE DIAGRAM. If this ever fails, the ribbons encode
    // expansion, which is the opposite of what the band argues.
    expect(geo.invariant.outflow).toBeLessThan(geo.invariant.inflow);
  });

  it("keeps the pinched stack inside the spine, with positive gaps", () => {
    expect(geo.invariant.fitsSpine).toBe(true);
    expect(geo.invariant.gapsPositive).toBe(true);
  });

  it("emits one ribbon per party, each a closed path with a centreline", () => {
    expect(geo.ribbons).toHaveLength(3);
    for (const r of geo.ribbons) {
      expect(r.path.startsWith("M")).toBe(true);
      expect(r.path.trimEnd().endsWith("Z")).toBe(true); // closed
      expect(r.centerline.startsWith("M")).toBe(true);
      expect(r.centerline).not.toContain("Z"); // open
    }
  });

  it("places nodes and spine within the viewBox", () => {
    for (const n of geo.nodes) {
      expect(n.topPct).toBeGreaterThanOrEqual(0);
      expect(n.topPct + n.heightPct).toBeLessThanOrEqual(100);
    }
    expect(geo.spine.leftPct + geo.spine.widthPct).toBeLessThanOrEqual(100);
    expect(FLOW_VIEW.w).toBe(1280);
  });

  // Guards a MEASURED fix, so it does not get "restored" to the spec's 760px.
  // Between 760 and 1024 the Sankey renders but its labels overflow their nodes
  // (percentage-sized boxes vs clamp()-floored text) — worst in Indonesian.
  it("hands over to the vertical stack while the diagram still fits its labels", () => {
    const css = readFileSync(
      new URL("../src/components/landing/landing.css", import.meta.url),
      "utf8",
    );
    const block = css.match(/@media \(max-width: ([\d.]+)px\) \{\s*\.mb-plat-figure \{\s*display: none;/);
    expect(block, "the platform-flow cutover query").not.toBeNull();
    expect(Number(block![1])).toBeGreaterThanOrEqual(1023);
  });

  it("is pure — repeated calls agree, so server and client render identically", () => {
    // The module also exports a memoised FLOW computed at load. If this ever
    // diverges, the band hydrates with different geometry than it server-rendered.
    const again = computeFlowGeometry();
    expect(again.ribbons.map((r) => r.path)).toEqual(geo.ribbons.map((r) => r.path));
    expect(again.invariant).toEqual(geo.invariant);
  });
});

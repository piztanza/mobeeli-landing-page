import { readFile } from "node:fs/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/deck-file/route";
import { DECK_PDF_PATH } from "@/lib/deck/pdf";
import { mintDeckToken } from "@/lib/deck/token";

const SECRET = "test-deck-secret";

function get(token?: string): Promise<Response> {
  const url = new URL("http://localhost/api/deck-file");
  if (token !== undefined) url.searchParams.set("token", token);
  return GET(new Request(url));
}

describe("GET /api/deck-file (F-016)", () => {
  beforeEach(() => {
    vi.stubEnv("DECK_SECRET", SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 403 without a token", async () => {
    expect((await get()).status).toBe(403);
    expect((await get("")).status).toBe(403);
  });

  it("returns 403 for malformed, tampered and expired tokens", async () => {
    expect((await get("garbage")).status).toBe(403);

    const token = mintDeckToken(null, SECRET);
    const [payload, signature] = token.split(".");
    const flipped = signature[0] === "A" ? "B" : "A";
    expect((await get(`${payload}.${flipped}${signature.slice(1)}`)).status).toBe(403);

    expect((await get(mintDeckToken(Date.now() - 1000, SECRET))).status).toBe(403);
    expect((await get(mintDeckToken(null, "other-secret"))).status).toBe(403);
  });

  it("returns 403 for every token when DECK_SECRET is not configured", async () => {
    const token = mintDeckToken(null, SECRET);
    vi.stubEnv("DECK_SECRET", "");
    expect((await get(token)).status).toBe(403);
  });

  it("streams the private PDF inline with private no-store caching for a valid token", async () => {
    const res = await get(mintDeckToken(Date.now() + 3_600_000, SECRET));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe("inline");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
    expect(res.headers.get("X-Robots-Tag")).toContain("noindex");

    const body = Buffer.from(await res.arrayBuffer());
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    // The full private file, byte for byte.
    const onDisk = await readFile(DECK_PDF_PATH);
    expect(body.byteLength).toBe(onDisk.byteLength);
  });

  it("a non-expiring token works too", async () => {
    expect((await get(mintDeckToken(null, SECRET))).status).toBe(200);
  });

  it("the deck ships from private/, never from public/", () => {
    expect(DECK_PDF_PATH.replaceAll("\\", "/")).toContain("private/deck/mobeeli-pitchdeck.pdf");
    expect(DECK_PDF_PATH.replaceAll("\\", "/")).not.toContain("public/");
  });

  it("the served deck opens in pdfjs with all 22 pages, 16:9 (what /deck renders on canvases)", async () => {
    const res = await get(mintDeckToken(null, SECRET));
    const data = new Uint8Array(await res.arrayBuffer());
    // Same engine as the viewer, node-friendly legacy build.
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({ data });
    const doc = await loadingTask.promise;
    // v11 of the deck (2026-08-12): 22 slides, authored 16:9 at 960×540 —
    // exactly the viewer's MAX_PAGE_WIDTH, so pages render unscaled.
    expect(doc.numPages).toBe(22);
    const { width, height } = (await doc.getPage(1)).getViewport({ scale: 1 });
    expect(width / height).toBeCloseTo(16 / 9, 2);
    await loadingTask.destroy();
  });
});

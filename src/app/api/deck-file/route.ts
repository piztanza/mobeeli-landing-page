import { readFile } from "node:fs/promises";

import { DECK_PDF_PATH } from "@/lib/deck/pdf";
import { deckSecret, stripTrackingSuffix, verifyDeckToken } from "@/lib/deck/token";

/**
 * GET /api/deck-file?token=… (F-016) — token-gated byte stream for the /deck
 * viewer. Missing, malformed, tampered or expired tokens → 403 (expiry is
 * enforced server-side here as well as on /deck). Valid → inline PDF with
 * private no-store caching and a noindex header; no attachment disposition, so
 * the browser never offers a download prompt of its own.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = deckSecret();
  const raw = new URL(request.url).searchParams.get("token");
  const token = raw === null ? null : stripTrackingSuffix(raw);
  if (!secret || !token || !verifyDeckToken(token, secret).ok) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const pdf = await readFile(DECK_PDF_PATH);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

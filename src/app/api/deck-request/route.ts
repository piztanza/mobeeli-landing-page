import { checkDeckRequestRateLimit } from "@/lib/deck/rateLimit";
import { deckRequestSchema } from "@/lib/deck/schema";
import { notifyDeckRequest } from "@/lib/email/deckRequest";
import { logDeckRequestToNotion } from "@/lib/notion/deckRequests";

/** First hop of x-forwarded-for (set by Vercel's proxy); "unknown" bucket otherwise. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/deck-request (F-016) — the platform database is never touched;
 * requests go to the team inbox and to the founders' Notion tracker:
 *  1. per-IP rate limit (5/hour) → 429;
 *  2. zod validation (name/firm/work-email required) → 400;
 *  3. `_honeypot` non-empty → silent fake success, no email, no Notion row;
 *  4. Notion row in the Deck Requests database — best-effort: its outcome is
 *     reported inside the alert email and never fails the request;
 *  5. Resend alert to the team with the requester's details and the mint CTA.
 *     The email is the channel of record, so a failed send returns 500
 *     (retriable) and the client keeps the entered data.
 */
export async function POST(request: Request): Promise<Response> {
  if (!checkDeckRequestRateLimit(clientIp(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);

  const parsed = deckRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Honeypot tripped: pretend everything worked so bots learn nothing.
  if (parsed.data._honeypot.length > 0) {
    return Response.json({ ok: true });
  }

  const log = await logDeckRequestToNotion(parsed.data, {
    receivedAtIso: new Date().toISOString(),
    // Vercel's edge geo header — no cookie, no tracker, no client script.
    country: request.headers.get("x-vercel-ip-country") ?? undefined,
  });
  if (log.status === "failed") {
    console.error("deck-request: failed to log to Notion", log.reason);
  }

  try {
    await notifyDeckRequest(parsed.data, log);
  } catch (error) {
    console.error("deck-request: failed to send team alert", error);
    return Response.json({ error: "alert_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

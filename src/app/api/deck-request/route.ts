import { checkDeckRequestRateLimit } from "@/lib/deck/rateLimit";
import { deckRequestSchema } from "@/lib/deck/schema";
import { notifyDeckRequest } from "@/lib/email/deckRequest";

/** First hop of x-forwarded-for (set by Vercel's proxy); "unknown" bucket otherwise. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/deck-request (F-016) — email-only, no database writes:
 *  1. per-IP rate limit (5/hour) → 429;
 *  2. zod validation (name/firm/work-email required) → 400;
 *  3. `_honeypot` non-empty → silent fake success, no email;
 *  4. Resend alert to the team with the requester's details and the three
 *     mint options — there is no persistence fallback here, so a failed send
 *     returns 500 (retriable) and the client keeps the entered data.
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

  try {
    await notifyDeckRequest(parsed.data);
  } catch (error) {
    console.error("deck-request: failed to send team alert", error);
    return Response.json({ error: "alert_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

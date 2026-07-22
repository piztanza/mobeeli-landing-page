import { addBuyerContact, notifyBuyerFallback } from "@/lib/notify/audience";
import { checkNotifyRateLimit } from "@/lib/notify/rateLimit";
import { notifyPayloadSchema } from "@/lib/notify/schema";

/** First hop of x-forwarded-for (set by Vercel's proxy); "unknown" bucket otherwise. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/notify (F-015) — the buyer strip's "get notified" capture:
 *  1. per-IP rate limit (10/hour) → 429;
 *  2. zod validation (email required) → 400, bilingual inline error client-side;
 *  3. `_honeypot` non-empty → silent fake success, nothing captured;
 *  4. add the address to the Resend audience tagged source=buyer_launch
 *     (duplicates resolve as success — the buyer is already on the list);
 *  5. on ANY capture failure (zero/multiple audiences from auto-discovery,
 *     Resend outage, …): log + alert-email fallback to WAITLIST_ALERT_TO with
 *     the buyer address, then still 200 — the address reached the team, so
 *     nothing is lost. Only when the fallback ALSO fails does the client get a
 *     retriable 500.
 */
export async function POST(request: Request): Promise<Response> {
  if (!checkNotifyRateLimit(clientIp(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);

  const parsed = notifyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Honeypot tripped: pretend everything worked so bots learn nothing.
  if (parsed.data._honeypot.length > 0) {
    return Response.json({ ok: true });
  }

  try {
    await addBuyerContact(parsed.data.email);
  } catch (error) {
    console.error("notify: failed to add buyer contact to the Resend audience", error);
    try {
      await notifyBuyerFallback(
        parsed.data.email,
        error instanceof Error ? error.message : String(error),
      );
    } catch (fallbackError) {
      // Both paths failed — the address WOULD be lost, so let the client retry.
      console.error("notify: fallback alert failed — buyer address not captured", fallbackError);
      return Response.json({ error: "capture_failed" }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}

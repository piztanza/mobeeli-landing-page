import { logBuyerSignupToNotion } from "@/lib/notion/buyerSignups";
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
 *  5. log the signup to the Notion Buyer Signups database either way, with
 *     "Mailing list" recording whether step 4 worked — best-effort, and never
 *     a reason to fail the signup;
 *  6. when step 4 failed: alert-email fallback to WAITLIST_ALERT_TO with the
 *     buyer address (and a link to the Notion row).
 *
 * Three places can hold the address, and the buyer only sees a retriable 500
 * when NONE of them did: the Resend audience, the fallback email, the Notion
 * row.
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

  let audienceError: string | null = null;
  try {
    await addBuyerContact(parsed.data.email);
  } catch (error) {
    audienceError = error instanceof Error ? error.message : String(error);
    console.error("notify: failed to add buyer contact to the Resend audience", error);
  }

  const log = await logBuyerSignupToNotion(parsed.data, {
    receivedAtIso: new Date().toISOString(),
    // Vercel's edge geo header — no cookie, no tracker, no client script.
    country: request.headers.get("x-vercel-ip-country") ?? undefined,
    onMailingList: audienceError === null,
  });
  if (log.status === "failed") {
    console.error("notify: failed to log the buyer signup to Notion", log.reason);
  }

  if (audienceError !== null) {
    try {
      await notifyBuyerFallback(
        parsed.data.email,
        audienceError,
        log.status === "logged" ? log.url : undefined,
      );
    } catch (fallbackError) {
      console.error("notify: fallback alert failed", fallbackError);
      // Resend lost it both ways. The Notion row is the last copy — without
      // one, the address really would be dropped, so let the client retry.
      if (log.status !== "logged") {
        return Response.json({ error: "capture_failed" }, { status: 500 });
      }
    }
  }

  return Response.json({ ok: true });
}

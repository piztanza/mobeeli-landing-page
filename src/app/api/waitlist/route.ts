import { notifyNewLead } from "@/lib/email/notify";
import { logSellerWaitlistToNotion } from "@/lib/notion/sellerWaitlist";
import { persistLead } from "@/lib/waitlist/persist";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { waitlistPayloadSchema } from "@/lib/waitlist/schema";

/** First hop of x-forwarded-for (set by Vercel's proxy); "unknown" bucket otherwise. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/waitlist (F-008) — mirrors the platform's /api/partners/signup
 * contract (uppercase partnerType, contactPhone, currentToolsUsed/brandsCarried
 * arrays, _honeypot) and validates, persists, notifies:
 *  1. per-IP rate limit;
 *  2. zod validation (platform whitelists/regexes/limits) → 400;
 *  3. `_honeypot` non-empty → silent fake success, no insert, no email;
 *  4. drizzle insert into partner_signups (JSONL fallback without
 *     DATABASE_URL) — MUST succeed before the client may show success, so a
 *     failure returns 500 (retriable);
 *  5. Resend alert to the team, only when the lead was stored;
 *  6. mirror the lead into the Notion Seller Waitlist database — ALWAYS, with
 *     the "Platform DB" column recording whether step 4 worked.
 *
 * Step 6 runs even when step 4 failed, and that is the point. On 2026-08-01
 * Neon went read-only and every /join signup evaporated: 500 to the visitor,
 * no row, no email, nothing to replay. Now a failed insert still returns its
 * retriable 500 — the visitor's experience is unchanged, and `partner_signups`
 * is still the system of record — but the lead survives in Notion flagged
 * "Not stored — replay". A visitor who retries successfully leaves a duplicate
 * row; that is a visible, cheap merge, and strictly better than a lost lead.
 */
export async function POST(request: Request): Promise<Response> {
  if (!checkRateLimit(clientIp(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);

  const parsed = waitlistPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Honeypot tripped: pretend everything worked so bots learn nothing.
  if (parsed.data._honeypot.length > 0) {
    return Response.json({ ok: true });
  }

  let stored = true;
  try {
    await persistLead(parsed.data);
  } catch (error) {
    stored = false;
    console.error("waitlist: failed to persist lead", error);
  }

  if (stored) {
    try {
      await notifyNewLead(parsed.data);
    } catch (error) {
      // Lead is already stored — log and still report success to the client.
      console.error("waitlist: lead stored but email alert failed", error);
    }
  }

  const log = await logSellerWaitlistToNotion(parsed.data, {
    receivedAtIso: new Date().toISOString(),
    // Vercel's edge geo header — no cookie, no tracker, no client script.
    country: request.headers.get("x-vercel-ip-country") ?? undefined,
    storedInPlatformDb: stored,
  });
  if (log.status === "failed") {
    console.error(
      stored
        ? "waitlist: lead stored but Notion logging failed"
        : "waitlist: LEAD LOST — the insert failed and Notion capture failed too",
      log.reason,
    );
  }

  // The insert alone decides the response: a lead that isn't in
  // partner_signups is not a success, however well the capture went.
  if (!stored) {
    return Response.json({ error: "persist_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

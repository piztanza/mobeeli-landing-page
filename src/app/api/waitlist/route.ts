import { notifyNewLead } from "@/lib/email/notify";
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
 *  5. Resend alert to the team — failure after a successful insert is logged
 *     but still returns 200 (the lead is safe).
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

  try {
    await persistLead(parsed.data);
  } catch (error) {
    console.error("waitlist: failed to persist lead", error);
    return Response.json({ error: "persist_failed" }, { status: 500 });
  }

  try {
    await notifyNewLead(parsed.data);
  } catch (error) {
    // Lead is already stored — log and still report success to the client.
    console.error("waitlist: lead stored but email alert failed", error);
  }

  return Response.json({ ok: true });
}

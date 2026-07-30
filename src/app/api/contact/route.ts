import { checkContactRateLimit } from "@/lib/contact/rateLimit";
import { contactSchema } from "@/lib/contact/schema";
import { notifyContactMessage } from "@/lib/email/contactMessage";

/** First hop of x-forwarded-for (set by Vercel's proxy); "unknown" bucket otherwise. */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/contact (R30b) — email-only, no database writes (the waitlist
 * table is insert-only for /join and never takes contact messages):
 *  1. per-IP rate limit (5/hour) → 429;
 *  2. zod validation (name/email/message required) → 400;
 *  3. `_honeypot` non-empty → silent fake success, no email;
 *  4. Resend alert to the team with reply-to set to the sender — a failed
 *     send returns 500 (retriable) and the client keeps the entered data.
 */
export async function POST(request: Request): Promise<Response> {
  if (!checkContactRateLimit(clientIp(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Honeypot tripped: pretend everything worked so bots learn nothing.
  if (parsed.data._honeypot.length > 0) {
    return Response.json({ ok: true });
  }

  try {
    await notifyContactMessage(parsed.data);
  } catch (error) {
    console.error("contact: failed to send team alert", error);
    return Response.json({ error: "alert_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

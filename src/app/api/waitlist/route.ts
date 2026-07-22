import { waitlistPayloadSchema } from "@/lib/waitlist/schema";

/**
 * POST /api/waitlist — foundation stub.
 * Validates the payload server-side (zod, incl. honeypot + length limits) and
 * returns 501 until persistence (drizzle insert) + Resend notification land
 * with the waitlist backend feature (F-008). Rate limiting also lands there.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = waitlistPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }
  return Response.json({ error: "not_implemented" }, { status: 501 });
}

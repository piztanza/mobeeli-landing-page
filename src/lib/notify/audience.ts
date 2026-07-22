import { Resend } from "resend";

/**
 * Resend Audience capture for the buyer strip (F-015). Buyer addresses become
 * contacts in the account's single Audience, tagged with a contact property so
 * the user's existing "Buyers" segment (filter: source = buyer_launch) picks
 * them up. No database writes — Resend IS the store for this feature.
 */

/** Contact property key the "Buyers" segment filters on (documented in README). */
export const BUYER_SOURCE_PROPERTY = "source";
/** Contact property value identifying buyer-strip signups. */
export const BUYER_SOURCE_VALUE = "buyer_launch";

/** Sender for fallback alerts; same shared onboarding sender as the waitlist. */
const FROM = "Mobeeli Buyer Notify <onboarding@resend.dev>";

/**
 * Thrown when auto-discovery cannot pick an audience (zero or multiple exist
 * and RESEND_AUDIENCE_ID is unset). The route falls back to an alert email so
 * the buyer address is never lost.
 */
export class AudienceDiscoveryError extends Error {
  readonly count: number;

  constructor(count: number) {
    super(
      `Resend audience auto-discovery found ${count} audiences — expected exactly one. ` +
        "Set RESEND_AUDIENCE_ID to disambiguate.",
    );
    this.name = "AudienceDiscoveryError";
    this.count = count;
  }
}

/** Module-scope cache: discovery hits the Resend API once per server instance. */
let discoveredAudienceId: string | null = null;

/** Test-only: clears the discovery cache. */
export function resetAudienceCache(): void {
  discoveredAudienceId = null;
}

function resendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — configure it in the server environment.");
  }
  return new Resend(apiKey);
}

/**
 * Resolve the target audience id: RESEND_AUDIENCE_ID when set (no API call);
 * otherwise auto-discovery requiring EXACTLY one audience on the account,
 * cached at module scope. Zero or multiple audiences → AudienceDiscoveryError.
 */
export async function resolveBuyerAudienceId(resend: Resend): Promise<string> {
  const configured = process.env.RESEND_AUDIENCE_ID?.trim();
  if (configured) return configured;

  if (discoveredAudienceId) return discoveredAudienceId;

  const { data, error } = await resend.audiences.list();
  if (error) {
    throw new Error(`Resend audience list failed: ${error.message}`);
  }
  const audiences = data.data;
  if (audiences.length !== 1) {
    throw new AudienceDiscoveryError(audiences.length);
  }
  discoveredAudienceId = audiences[0].id;
  return discoveredAudienceId;
}

/** Resend reports an existing contact as an error; for us that IS success. */
function isAlreadyExists(error: { message: string; statusCode: number | null }): boolean {
  return error.statusCode === 409 || /already exists/i.test(error.message);
}

/**
 * Add a buyer email to the Resend audience, tagged source=buyer_launch so the
 * user's "Buyers" segment includes it. A duplicate email resolves normally
 * (the buyer is already captured — the client shows the same success state).
 * Throws AudienceDiscoveryError / Error on anything else so the route can run
 * the alert-email fallback.
 */
export async function addBuyerContact(email: string): Promise<void> {
  const resend = resendClient();
  const audienceId = await resolveBuyerAudienceId(resend);

  const { error } = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
    properties: { [BUYER_SOURCE_PROPERTY]: BUYER_SOURCE_VALUE },
  });
  if (error && !isAlreadyExists(error)) {
    throw new Error(`Resend contact create failed: ${error.message}`);
  }
}

/**
 * Fallback alert when the contact could not be added (e.g. zero/multiple
 * audiences): email the buyer's address to WAITLIST_ALERT_TO so nothing is
 * lost. Throws on missing config or send failure — the route then surfaces a
 * retriable 500, because at that point the address really would be dropped.
 */
export async function notifyBuyerFallback(email: string, reason: string): Promise<void> {
  const to = process.env.WAITLIST_ALERT_TO;
  if (!to) {
    throw new Error("WAITLIST_ALERT_TO is not set — configure it in the server environment.");
  }

  const text = [
    "A buyer asked to be notified at launch, but the address could not be added to the Resend audience.",
    "",
    `Email: ${email}`,
    `Reason: ${reason}`,
    `Received: ${new Date().toISOString()}`,
    "",
    `Add them manually (property ${BUYER_SOURCE_PROPERTY}=${BUYER_SOURCE_VALUE} for the Buyers segment).`,
  ].join("\n");

  const { error } = await resendClient().emails.send({
    from: FROM,
    to,
    subject: `Buyer notify signup (fallback) — ${email}`,
    text,
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

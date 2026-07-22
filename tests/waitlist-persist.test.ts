import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Spy chain standing in for the drizzle client: getDb().insert(table).values(row). */
const { insert, values } = vi.hoisted(() => {
  const values = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn(() => ({ values }));
  return { insert, values };
});

vi.mock("@/lib/db/client", () => ({ getDb: () => ({ insert }) }));

import { partnerSignups } from "@/lib/db/schema";
import { persistLead } from "@/lib/waitlist/persist";
import { waitlistPayloadSchema } from "@/lib/waitlist/schema";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const lead = waitlistPayloadSchema.parse({
  partnerType: "GARAGE",
  businessName: "Bengkel Sumber Rejeki",
  contactName: "Budi",
  email: "budi@example.com",
  contactPhone: "+62 811 111 222",
  whatsappNumber: "+62 812 3456 789",
  city: "Jakarta",
  monthlyOrderVolume: "10-50",
  currentToolsUsed: ["Excel", "WhatsApp Order"],
  interestedInNet30: true,
  message: "Halo tim Mobeeli",
  lang: "id",
  _honeypot: "",
});

describe("persistLead → partner_signups insert shape", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://unit-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("inserts EXACTLY the allowed columns: generated id/updatedAt, landing source, no platform-owned fields", async () => {
    await persistLead(lead);

    expect(insert).toHaveBeenCalledExactlyOnceWith(partnerSignups);
    expect(values).toHaveBeenCalledTimes(1);
    const row = values.mock.calls[0][0];

    // The exact insert shape — nothing more, nothing less.
    expect(Object.keys(row).sort()).toEqual([
      "brandsCarried",
      "businessName",
      "city",
      "contactName",
      "contactPhone",
      "currentToolsUsed",
      "email",
      "id",
      "interestedInNet30",
      "message",
      "monthlyOrderVolume",
      "partnerType",
      "source",
      "updatedAt",
      "whatsappNumber",
    ]);

    // Generated at insert time.
    expect(row.id).toMatch(UUID_RE);
    expect(row.updatedAt).toBeInstanceOf(Date);
    // Landing provenance tag.
    expect(row.source).toBe("LANDING_MOBEELI_COM");
    // Payload values pass through under the platform's field names.
    expect(row.partnerType).toBe("GARAGE");
    expect(row.businessName).toBe("Bengkel Sumber Rejeki");
    expect(row.contactPhone).toBe("+62 811 111 222");
    expect(row.currentToolsUsed).toEqual(["Excel", "WhatsApp Order"]);
    expect(row.brandsCarried).toEqual([]);
    expect(row.interestedInNet30).toBe(true);

    // Never written: DB-defaulted, platform-owned triage/telemetry, and landing-only fields.
    for (const forbidden of [
      "status",
      "createdAt",
      "utm",
      "sessionId",
      "internalNote",
      "reviewedBy",
      "reviewedAt",
      "convertedUserId",
      "lang",
      "_honeypot",
    ]) {
      expect(row).not.toHaveProperty(forbidden);
    }
  });

  it("generates a fresh uuid per insert", async () => {
    await persistLead(lead);
    await persistLead(lead);
    const [first, second] = values.mock.calls.map((call) => call[0].id);
    expect(first).toMatch(UUID_RE);
    expect(second).toMatch(UUID_RE);
    expect(first).not.toBe(second);
  });
});

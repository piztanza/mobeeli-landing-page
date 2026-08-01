import { afterEach, describe, expect, it, vi } from "vitest";

import { logSellerWaitlistToNotion, sellerWaitlistNotionPage } from "@/lib/notion/sellerWaitlist";
import { waitlistPayloadSchema } from "@/lib/waitlist/schema";

/**
 * /join signups are mirrored into the Notion Seller Waitlist database. The
 * contract: the column mapping matches that database's schema, an optional
 * field the wizard skipped leaves its column EMPTY rather than writing "", and
 * logging is best-effort — the lead is already in `partner_signups` by the
 * time this runs, so nothing here may change what the client sees.
 */

const DB_ID = "76cbd7f55cda4327a12aee08e6b56d3f";
const CONTEXT = {
  receivedAtIso: "2026-08-01T09:30:00.000Z",
  country: "ID",
  storedInPlatformDb: true,
};

const lead = waitlistPayloadSchema.parse({
  partnerType: "GARAGE",
  businessName: "Bengkel Jaya Motor",
  contactName: "Pak Budi",
  email: "Budi@JayaMotor.co.id",
  contactPhone: "+62 812 3456 7890",
  whatsappNumber: "+62 812 3456 7891",
  city: "Bandung",
  monthlyOrderVolume: "50-200",
  currentToolsUsed: ["Excel", "WhatsApp Order"],
  brandsCarried: ["Denso", "NGK", "Aspira"],
  interestedInNet30: true,
  message: "Kami butuh katalog yang cocok dengan mobil pelanggan.",
  lang: "id",
});

/** Only what the wizard demands: type + business name. */
const minimalLead = waitlistPayloadSchema.parse({
  partnerType: "DISTRIBUTOR",
  businessName: "PT Sumber Onderdil",
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("seller waitlist → Notion payload", () => {
  const page = sellerWaitlistNotionPage(lead, CONTEXT, DB_ID);
  const properties = page.properties as Record<string, Record<string, unknown>>;

  it("targets the configured database", () => {
    expect(page.parent).toEqual({ database_id: DB_ID });
  });

  it("maps the wizard answers onto the Seller Waitlist columns", () => {
    expect(properties.Business.title).toEqual([{ text: { content: "Bengkel Jaya Motor" } }]);
    expect(properties["Contact name"].rich_text).toEqual([{ text: { content: "Pak Budi" } }]);
    expect(properties.Email.email).toBe("budi@jayamotor.co.id");
    expect(properties.Phone.phone_number).toBe("+62 812 3456 7890");
    expect(properties.WhatsApp.phone_number).toBe("+62 812 3456 7891");
    expect(properties.City.select).toEqual({ name: "Bandung" });
    expect(properties["Monthly orders"].select).toEqual({ name: "50-200" });
    expect(properties["Wants Net 30"].checkbox).toBe(true);
    expect(properties.Message.rich_text).toEqual([
      { text: { content: "Kami butuh katalog yang cocok dengan mobil pelanggan." } },
    ]);
  });

  it("titles the partner type for humans instead of the platform's SHOUTING enum", () => {
    expect(properties.Type.select).toEqual({ name: "Garage" });
    const store = sellerWaitlistNotionPage({ ...lead, partnerType: "STORE" }, CONTEXT, DB_ID)
      .properties as Record<string, Record<string, unknown>>;
    expect(store.Type.select).toEqual({ name: "Store" });
    const distributor = sellerWaitlistNotionPage(minimalLead, CONTEXT, DB_ID).properties as Record<
      string,
      Record<string, unknown>
    >;
    expect(distributor.Type.select).toEqual({ name: "Distributor" });
  });

  it("keeps tools as tags and brands as text — brands are free text and would breed options", () => {
    expect(properties["Current tools"].multi_select).toEqual([
      { name: "Excel" },
      { name: "WhatsApp Order" },
    ]);
    expect(properties["Brands carried"].rich_text).toEqual([
      { text: { content: "Denso, NGK, Aspira" } },
    ]);
  });

  it("stamps the server-side facts: received, country, language, source, New status", () => {
    expect(properties.Received.date).toEqual({ start: CONTEXT.receivedAtIso });
    expect(properties.Country.rich_text).toEqual([{ text: { content: "ID" } }]);
    expect(properties.Language.select).toEqual({ name: "id" });
    expect(properties.Source.select).toEqual({ name: "Landing — /join" });
    expect(properties.Status.select).toEqual({ name: "New" });
  });

  it("records whether the lead reached partner_signups — a failed insert is flagged for replay", () => {
    expect(properties["Platform DB"].select).toEqual({ name: "Stored" });

    const lost = sellerWaitlistNotionPage(lead, { ...CONTEXT, storedInPlatformDb: false }, DB_ID)
      .properties as Record<string, Record<string, unknown>>;
    expect(lost["Platform DB"].select).toEqual({ name: "Not stored — replay" });
  });

  it("repeats the message in the page body so the row reads on its own", () => {
    expect(JSON.stringify(page.children)).toContain("Kami butuh katalog");
  });

  it("leaves skipped fields empty — null, not an empty string", () => {
    const props = sellerWaitlistNotionPage(
      minimalLead,
      { receivedAtIso: CONTEXT.receivedAtIso, storedInPlatformDb: true },
      DB_ID,
    ).properties as Record<string, Record<string, unknown>>;
    expect(props.Email.email).toBeNull();
    expect(props.Phone.phone_number).toBeNull();
    expect(props.WhatsApp.phone_number).toBeNull();
    expect(props.City.select).toBeNull();
    expect(props["Monthly orders"].select).toBeNull();
    expect(props["Current tools"].multi_select).toEqual([]);
    expect(props["Brands carried"].rich_text).toEqual([]);
    expect(props["Contact name"].rich_text).toEqual([]);
    expect(props.Country.rich_text).toEqual([]);
    expect(props["Wants Net 30"].checkbox).toBe(false);
    // lang defaults to en when the payload omits it.
    expect(props.Language.select).toEqual({ name: "en" });
    expect(
      JSON.stringify(sellerWaitlistNotionPage(minimalLead, CONTEXT, DB_ID).children),
    ).toContain("(no message)");
  });
});

describe("logSellerWaitlistToNotion is best-effort", () => {
  it("skips silently when the integration is not configured", async () => {
    vi.stubEnv("NOTION_TOKEN", "");
    vi.stubEnv("NOTION_SELLERS_DB_ID", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(logSellerWaitlistToNotion(lead, CONTEXT)).resolves.toEqual({ status: "skipped" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("skips when only the token is set — the sellers database is its own id", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_SELLERS_DB_ID", "");
    await expect(logSellerWaitlistToNotion(lead, CONTEXT)).resolves.toEqual({ status: "skipped" });
  });

  it("posts to the Notion pages API and returns the row url", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_SELLERS_DB_ID", DB_ID);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "row-1", url: "https://notion.so/seller-row" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(logSellerWaitlistToNotion(lead, CONTEXT)).resolves.toEqual({
      status: "logged",
      url: "https://notion.so/seller-row",
      id: "row-1",
    });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.notion.com/v1/pages");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string).parent).toEqual({ database_id: DB_ID });
  });

  it("reports Notion errors and network failures instead of throwing", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_SELLERS_DB_ID", DB_ID);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("object_not_found", { status: 404 }),
    );
    await expect(logSellerWaitlistToNotion(lead, CONTEXT)).resolves.toMatchObject({
      status: "failed",
      reason: expect.stringContaining("object_not_found"),
    });

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("socket hang up"));
    await expect(logSellerWaitlistToNotion(lead, CONTEXT)).resolves.toEqual({
      status: "failed",
      reason: "socket hang up",
    });
  });
});

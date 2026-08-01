import { afterEach, describe, expect, it, vi } from "vitest";

import { buyerSignupNotionPage, logBuyerSignupToNotion } from "@/lib/notion/buyerSignups";
import { notifyPayloadSchema } from "@/lib/notify/schema";

/**
 * "Get notified" signups are mirrored into the Notion Buyer Signups database.
 * The contract: the column mapping matches that database's schema, "Mailing
 * list" tells the truth about whether Resend actually took the address, and
 * logging is best-effort — POST /api/notify must never fail a buyer because
 * Notion was unreachable.
 */

const DB_ID = "f9130622595e4dcdaa049f97ce1b1768";

const payload = notifyPayloadSchema.parse({ email: "Bengkel@Jaya.co.id", lang: "id" });

const context = { receivedAtIso: "2026-08-01T09:30:00.000Z", country: "ID", onMailingList: true };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("buyer signup → Notion payload", () => {
  const page = buyerSignupNotionPage(payload, context, DB_ID);
  const properties = page.properties as Record<string, Record<string, unknown>>;

  it("targets the configured database", () => {
    expect(page.parent).toEqual({ database_id: DB_ID });
  });

  it("uses the (lowercased) address as the row title — the only field collected", () => {
    expect(properties.Email.title).toEqual([{ text: { content: "bengkel@jaya.co.id" } }]);
  });

  it("stamps the server-side facts: received, country, language, source, New status", () => {
    expect(properties.Received.date).toEqual({ start: context.receivedAtIso });
    expect(properties.Country.rich_text).toEqual([{ text: { content: "ID" } }]);
    expect(properties.Language.select).toEqual({ name: "id" });
    expect(properties.Source.select).toEqual({ name: "Landing — buyer strip" });
    expect(properties.Status.select).toEqual({ name: "New" });
  });

  it("derives the triage helpers: email domain and work-vs-free mailbox", () => {
    expect(properties["Email domain"].rich_text).toEqual([{ text: { content: "jaya.co.id" } }]);
    expect(properties["Email type"].select).toEqual({ name: "Work" });
  });

  it("records whether Resend took the address", () => {
    expect(properties["Mailing list"].select).toEqual({ name: "Added to Resend" });

    const failed = buyerSignupNotionPage(payload, { ...context, onMailingList: false }, DB_ID)
      .properties as Record<string, Record<string, unknown>>;
    expect(failed["Mailing list"].select).toEqual({ name: "Needs manual add" });
  });

  it("keeps a missing country from breaking the payload", () => {
    const built = buyerSignupNotionPage(
      payload,
      { receivedAtIso: context.receivedAtIso, onMailingList: true },
      DB_ID,
    ).properties as Record<string, Record<string, unknown>>;
    expect(built.Country.rich_text).toEqual([]);
  });
});

describe("logBuyerSignupToNotion is best-effort", () => {
  it("skips silently when the integration is not configured", async () => {
    vi.stubEnv("NOTION_TOKEN", "");
    vi.stubEnv("NOTION_BUYERS_DB_ID", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(logBuyerSignupToNotion(payload, context)).resolves.toEqual({ status: "skipped" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("skips when only the token is set — the buyers database is separate from the deck one", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_BUYERS_DB_ID", "");
    await expect(logBuyerSignupToNotion(payload, context)).resolves.toEqual({ status: "skipped" });
  });

  it("posts to the Notion pages API and returns the row url", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_BUYERS_DB_ID", DB_ID);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "row-1", url: "https://notion.so/buyer-row" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(logBuyerSignupToNotion(payload, context)).resolves.toEqual({
      status: "logged",
      url: "https://notion.so/buyer-row",
      id: "row-1",
    });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.notion.com/v1/pages");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret_token");
    expect(JSON.parse(init.body as string).parent).toEqual({ database_id: DB_ID });
  });

  it("reports Notion errors and network failures instead of throwing", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_BUYERS_DB_ID", DB_ID);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("object_not_found", { status: 404 }),
    );
    const notFound = await logBuyerSignupToNotion(payload, context);
    expect(notFound).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("object_not_found"),
    });

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("socket hang up"));
    await expect(logBuyerSignupToNotion(payload, context)).resolves.toEqual({
      status: "failed",
      reason: "socket hang up",
    });
  });
});

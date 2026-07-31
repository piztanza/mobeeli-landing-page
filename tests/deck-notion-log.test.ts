import { afterEach, describe, expect, it, vi } from "vitest";

import { deckRequestSchema } from "@/lib/deck/schema";
import {
  deckLinkSentProperties,
  deckRequestNotionPage,
  emailDomain,
  emailType,
  logDeckRequestToNotion,
  markDeckLinkSent,
  normalizeLink,
} from "@/lib/notion/deckRequests";

/**
 * Deck requests are logged into the founders' Notion "Deck Requests" database.
 * The contract these tests pin: the column mapping matches that database's
 * schema, and logging is strictly best-effort — a missing token, a 4xx or a
 * network error resolves to a reported failure instead of throwing, because
 * POST /api/deck-request must still send the alert email.
 */

const DB_ID = "f609475a65e340118e320dbaf48b4524";
const CONTEXT = { receivedAtIso: "2026-08-01T09:30:00.000Z", country: "SG" };

const request = deckRequestSchema.parse({
  name: "Ada Lovelace",
  firm: "Analytical Capital",
  email: "Ada@Fund.com",
  linkedin: "linkedin.com/in/ada",
  message: "Following SEA commerce infra.",
  lang: "id",
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("deck request → Notion payload", () => {
  const page = deckRequestNotionPage(request, CONTEXT, DB_ID);
  const properties = page.properties as Record<string, Record<string, unknown>>;

  it("targets the configured database", () => {
    expect(page.parent).toEqual({ database_id: DB_ID });
  });

  it("maps the form fields onto the Deck Requests columns", () => {
    expect(properties.Name.title).toEqual([{ text: { content: "Ada Lovelace" } }]);
    expect(properties["Firm / fund"].rich_text).toEqual([
      { text: { content: "Analytical Capital" } },
    ]);
    expect(properties.Email.email).toBe("ada@fund.com");
    expect(properties.Message.rich_text).toEqual([
      { text: { content: "Following SEA commerce infra." } },
    ]);
    expect(properties.Language.select).toEqual({ name: "id" });
  });

  it("stamps the server-side facts: received, country, source, and a New status", () => {
    expect(properties.Received.date).toEqual({ start: CONTEXT.receivedAtIso });
    expect(properties.Country.rich_text).toEqual([{ text: { content: "SG" } }]);
    expect(properties.Source.select).toEqual({ name: "Landing — /investors" });
    expect(properties.Status.select).toEqual({ name: "New" });
  });

  it("derives the triage helpers: email domain and work-vs-free mailbox", () => {
    expect(properties["Email domain"].rich_text).toEqual([{ text: { content: "fund.com" } }]);
    expect(properties["Email type"].select).toEqual({ name: "Work" });

    expect(emailDomain("someone@Gmail.com")).toBe("gmail.com");
    expect(emailType("someone@gmail.com")).toBe("Free / personal");
    expect(emailType("someone@sequoiacap.com")).toBe("Work");
  });

  it("makes the free-text LinkedIn field URL-shaped, and blank stays empty", () => {
    expect(properties["LinkedIn / website"].url).toBe("https://linkedin.com/in/ada");
    expect(normalizeLink("https://ada.example")).toBe("https://ada.example");
    expect(normalizeLink("  ")).toBeNull();
    expect(normalizeLink(undefined)).toBeNull();
  });

  it("repeats the message in the page body so the row reads on its own", () => {
    expect(JSON.stringify(page.children)).toContain("Following SEA commerce infra.");
  });

  it("keeps an absent message from breaking the payload", () => {
    const minimal = deckRequestSchema.parse({
      name: "Bo",
      firm: "Solo Angel",
      email: "bo@example.com",
    });
    const built = deckRequestNotionPage(minimal, { receivedAtIso: CONTEXT.receivedAtIso }, DB_ID);
    const props = built.properties as Record<string, Record<string, unknown>>;
    expect(props.Message.rich_text).toEqual([]);
    expect(props.Country.rich_text).toEqual([]);
    expect(props["LinkedIn / website"].url).toBeNull();
    expect(JSON.stringify(built.children)).toContain("(no message)");
  });
});

describe("logDeckRequestToNotion is best-effort", () => {
  it("skips silently when the integration is not configured", async () => {
    vi.stubEnv("NOTION_TOKEN", "");
    vi.stubEnv("NOTION_DECK_DB_ID", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(logDeckRequestToNotion(request, CONTEXT)).resolves.toEqual({ status: "skipped" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to the Notion pages API with the token and returns the row url", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_DECK_DB_ID", DB_ID);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "row-1", url: "https://notion.so/row" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(logDeckRequestToNotion(request, CONTEXT)).resolves.toEqual({
      status: "logged",
      url: "https://notion.so/row",
      // Carried into the alert email's mint link so /deck-admin can write back.
      id: "row-1",
    });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.notion.com/v1/pages");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer secret_token");
    expect(headers["Notion-Version"]).toBe("2022-06-28");
    expect(JSON.parse(init.body as string).parent).toEqual({ database_id: DB_ID });
  });

  it("reports a Notion error response instead of throwing", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_DECK_DB_ID", DB_ID);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("object_not_found: share the database with the integration", { status: 404 }),
    );

    const result = await logDeckRequestToNotion(request, CONTEXT);
    expect(result.status).toBe("failed");
    expect(result).toMatchObject({ reason: expect.stringContaining("404") });
    expect(result).toMatchObject({ reason: expect.stringContaining("object_not_found") });
  });

  it("reports a network failure instead of throwing", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    vi.stubEnv("NOTION_DECK_DB_ID", DB_ID);
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("socket hang up"));

    await expect(logDeckRequestToNotion(request, CONTEXT)).resolves.toEqual({
      status: "failed",
      reason: "socket hang up",
    });
  });
});

describe("markDeckLinkSent writes the minted link back onto the row", () => {
  it("fills Deck link sent, Link expires and Status in one update", () => {
    const expiresAtMs = Date.parse("2026-08-08T10:00:00.000Z");
    expect(
      deckLinkSentProperties({ url: "https://mobeeli.com/deck?token=t", expiresAtMs }),
    ).toEqual({
      "Deck link sent": { url: "https://mobeeli.com/deck?token=t" },
      "Link expires": { date: { start: "2026-08-08T10:00:00.000Z" } },
      Status: { select: { name: "Link sent" } },
    });
  });

  it("leaves Link expires empty for a non-expiring link", () => {
    const props = deckLinkSentProperties({
      url: "https://mobeeli.com/deck?token=t",
      expiresAtMs: null,
    });
    expect(props["Link expires"]).toEqual({ date: null });
  });

  it("PATCHes the request's page and reports success", async () => {
    vi.stubEnv("NOTION_TOKEN", "secret_token");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await expect(
      markDeckLinkSent("row-1", { url: "https://mobeeli.com/deck?token=t", expiresAtMs: null }),
    ).resolves.toEqual({ status: "saved" });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.notion.com/v1/pages/row-1");
    expect(init.method).toBe("PATCH");
  });

  it("skips without a token or a row, and reports Notion errors", async () => {
    vi.stubEnv("NOTION_TOKEN", "");
    await expect(markDeckLinkSent("row-1", { url: "u", expiresAtMs: null })).resolves.toEqual({
      status: "skipped",
    });

    vi.stubEnv("NOTION_TOKEN", "secret_token");
    await expect(markDeckLinkSent("", { url: "u", expiresAtMs: null })).resolves.toEqual({
      status: "skipped",
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 400 }));
    const result = await markDeckLinkSent("row-1", { url: "u", expiresAtMs: null });
    expect(result).toMatchObject({ status: "failed", reason: expect.stringContaining("400") });
  });
});

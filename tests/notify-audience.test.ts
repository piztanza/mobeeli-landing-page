import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addBuyerContact,
  AudienceDiscoveryError,
  BUYER_SOURCE_PROPERTY,
  BUYER_SOURCE_VALUE,
  notifyBuyerFallback,
  resetAudienceCache,
} from "@/lib/notify/audience";

const { listMock, createMock, sendMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  createMock: vi.fn(),
  sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    audiences = { list: listMock };
    contacts = { create: createMock };
    emails = { send: sendMock };
  },
}));

function audienceList(ids: string[]) {
  return {
    data: {
      object: "list",
      data: ids.map((id) => ({ id, name: `Audience ${id}`, created_at: "" })),
      has_more: false,
    },
    error: null,
  };
}

describe("buyer audience capture (F-015)", () => {
  beforeEach(() => {
    resetAudienceCache();
    listMock.mockReset().mockResolvedValue(audienceList(["aud_only"]));
    createMock.mockReset().mockResolvedValue({ data: { id: "c_1" }, error: null });
    sendMock.mockReset().mockResolvedValue({ data: { id: "e_1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("WAITLIST_ALERT_TO", "team@mobeeli.com");
    vi.stubEnv("RESEND_AUDIENCE_ID", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("tags the contact source=buyer_launch in the discovered audience", async () => {
    await addBuyerContact("buyer@example.com");
    expect(createMock).toHaveBeenCalledWith({
      audienceId: "aud_only",
      email: "buyer@example.com",
      unsubscribed: false,
      properties: { [BUYER_SOURCE_PROPERTY]: BUYER_SOURCE_VALUE },
    });
    expect(BUYER_SOURCE_PROPERTY).toBe("source");
    expect(BUYER_SOURCE_VALUE).toBe("buyer_launch");
  });

  it("uses RESEND_AUDIENCE_ID when set — no discovery call", async () => {
    vi.stubEnv("RESEND_AUDIENCE_ID", "aud_env");
    await addBuyerContact("buyer@example.com");
    expect(listMock).not.toHaveBeenCalled();
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ audienceId: "aud_env" }));
  });

  it("caches the discovered audience at module scope — one list call for many signups", async () => {
    await addBuyerContact("one@example.com");
    await addBuyerContact("two@example.com");
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it("zero audiences → AudienceDiscoveryError, nothing created", async () => {
    listMock.mockResolvedValue(audienceList([]));
    await expect(addBuyerContact("buyer@example.com")).rejects.toBeInstanceOf(
      AudienceDiscoveryError,
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("multiple audiences → AudienceDiscoveryError, nothing created", async () => {
    listMock.mockResolvedValue(audienceList(["aud_a", "aud_b"]));
    await expect(addBuyerContact("buyer@example.com")).rejects.toBeInstanceOf(
      AudienceDiscoveryError,
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("treats an already-existing contact as success (duplicate email → success UX)", async () => {
    createMock.mockResolvedValue({
      data: null,
      error: { message: "Contact already exists", statusCode: 409, name: "validation_error" },
    });
    await expect(addBuyerContact("buyer@example.com")).resolves.toBeUndefined();
  });

  it("still throws on other contact-create failures", async () => {
    createMock.mockResolvedValue({
      data: null,
      error: { message: "internal error", statusCode: 500, name: "internal_server_error" },
    });
    await expect(addBuyerContact("buyer@example.com")).rejects.toThrow("internal error");
  });

  it("fallback alert emails the buyer address to WAITLIST_ALERT_TO", async () => {
    await notifyBuyerFallback("buyer@example.com", "found 0 audiences");
    expect(sendMock).toHaveBeenCalledTimes(1);
    const args = sendMock.mock.calls[0][0] as { to: string; subject: string; text: string };
    expect(args.to).toBe("team@mobeeli.com");
    expect(args.subject).toContain("buyer@example.com");
    expect(args.text).toContain("buyer@example.com");
    expect(args.text).toContain("found 0 audiences");
    expect(args.text).toContain(`${BUYER_SOURCE_PROPERTY}=${BUYER_SOURCE_VALUE}`);
  });

  it("fallback throws on missing config or send failure", async () => {
    vi.stubEnv("WAITLIST_ALERT_TO", "");
    await expect(notifyBuyerFallback("buyer@example.com", "x")).rejects.toThrow(
      "WAITLIST_ALERT_TO",
    );
    vi.stubEnv("WAITLIST_ALERT_TO", "team@mobeeli.com");
    sendMock.mockResolvedValue({
      data: null,
      error: { message: "quota exceeded", statusCode: 429, name: "daily_quota_exceeded" },
    });
    await expect(notifyBuyerFallback("buyer@example.com", "x")).rejects.toThrow("quota exceeded");
  });

  it("throws without RESEND_API_KEY before touching the API", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    await expect(addBuyerContact("buyer@example.com")).rejects.toThrow("RESEND_API_KEY");
    expect(listMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});

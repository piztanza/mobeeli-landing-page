import { describe, expect, it } from "vitest";

import { notifyPayloadSchema } from "@/lib/notify/schema";

describe("notify payload schema (F-015)", () => {
  it("accepts a valid email and normalizes it (trim + lowercase)", () => {
    const parsed = notifyPayloadSchema.parse({ email: "  Buyer@Example.COM  " });
    expect(parsed.email).toBe("buyer@example.com");
    expect(parsed.lang).toBe("en");
    expect(parsed._honeypot).toBe("");
  });

  it("rejects invalid or missing emails", () => {
    for (const email of ["", "nope", "a@b", "a b@c.com", undefined]) {
      expect(notifyPayloadSchema.safeParse({ email }).success, String(email)).toBe(false);
    }
  });

  it("clamps overlong addresses to 200 chars", () => {
    const local = "a".repeat(300);
    const parsed = notifyPayloadSchema.parse({ email: `${local}@example.com` });
    expect(parsed.email).toHaveLength(200);
  });

  it("keeps the honeypot when filled and coerces non-strings to empty", () => {
    expect(notifyPayloadSchema.parse({ email: "a@b.co", _honeypot: "spam" })._honeypot).toBe(
      "spam",
    );
    expect(notifyPayloadSchema.parse({ email: "a@b.co", _honeypot: 42 })._honeypot).toBe("");
  });

  it("accepts both languages and rejects unknown ones", () => {
    expect(notifyPayloadSchema.parse({ email: "a@b.co", lang: "id" }).lang).toBe("id");
    expect(notifyPayloadSchema.safeParse({ email: "a@b.co", lang: "fr" }).success).toBe(false);
  });
});

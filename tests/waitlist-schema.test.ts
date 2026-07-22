import { describe, expect, it } from "vitest";

import { waitlistPayloadSchema } from "@/lib/waitlist/schema";

const minimalValid = { type: "store", businessName: "Toko Jaya Motor" };

describe("waitlist payload schema", () => {
  it("accepts a minimal valid payload and defaults lang to en", () => {
    const parsed = waitlistPayloadSchema.parse(minimalValid);
    expect(parsed.businessName).toBe("Toko Jaya Motor");
    expect(parsed.lang).toBe("en");
  });

  it("rejects a missing or empty businessName", () => {
    expect(waitlistPayloadSchema.safeParse({ type: "store" }).success).toBe(false);
    expect(
      waitlistPayloadSchema.safeParse({ type: "store", businessName: "  " }).success,
    ).toBe(false);
  });

  it("rejects an unknown business type", () => {
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, type: "wholesaler" }).success,
    ).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, website: "http://spam.example" }).success,
    ).toBe(false);
  });

  it("format-checks email only when present", () => {
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, email: "not-an-email" }).success,
    ).toBe(false);
    expect(waitlistPayloadSchema.safeParse({ ...minimalValid, email: "" }).success).toBe(true);
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, email: "owner@example.com" }).success,
    ).toBe(true);
  });

  it("enforces field length limits", () => {
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, businessName: "x".repeat(201) }).success,
    ).toBe(false);
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, message: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});

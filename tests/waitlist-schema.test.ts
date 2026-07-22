import { describe, expect, it } from "vitest";

import { waitlistPayloadSchema } from "@/lib/waitlist/schema";

const minimalValid = { partnerType: "STORE", businessName: "Toko Jaya Motor" };

describe("waitlist payload schema (platform /api/partners/signup contract)", () => {
  it("accepts a minimal valid payload with platform defaults", () => {
    const parsed = waitlistPayloadSchema.parse(minimalValid);
    expect(parsed.partnerType).toBe("STORE");
    expect(parsed.businessName).toBe("Toko Jaya Motor");
    expect(parsed.lang).toBe("en");
    expect(parsed.currentToolsUsed).toEqual([]);
    expect(parsed.brandsCarried).toEqual([]);
    expect(parsed.interestedInNet30).toBe(false);
    expect(parsed._honeypot).toBe("");
  });

  it("rejects a missing or empty businessName", () => {
    expect(waitlistPayloadSchema.safeParse({ partnerType: "STORE" }).success).toBe(false);
    expect(
      waitlistPayloadSchema.safeParse({ partnerType: "STORE", businessName: "  " }).success,
    ).toBe(false);
  });

  it("only accepts the platform's uppercase partnerType enum", () => {
    for (const partnerType of ["STORE", "GARAGE", "DISTRIBUTOR"]) {
      expect(
        waitlistPayloadSchema.safeParse({ ...minimalValid, partnerType }).success,
      ).toBe(true);
    }
    // Unknown and lowercase (the old landing shape) values → 400 at the route.
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, partnerType: "WHOLESALER" }).success,
    ).toBe(false);
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, partnerType: "store" }).success,
    ).toBe(false);
  });

  it("format-checks email only when non-empty and lowercases it", () => {
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, email: "not-an-email" }).success,
    ).toBe(false);
    expect(waitlistPayloadSchema.safeParse({ ...minimalValid, email: "" }).success).toBe(true);
    const parsed = waitlistPayloadSchema.parse({ ...minimalValid, email: "Owner@Example.COM" });
    expect(parsed.email).toBe("owner@example.com");
  });

  it("format-checks contactPhone/whatsappNumber with the platform regex only when non-empty", () => {
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, contactPhone: "call me" }).success,
    ).toBe(false);
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, whatsappNumber: "123" }).success,
    ).toBe(false); // < 6 chars
    expect(waitlistPayloadSchema.safeParse({ ...minimalValid, contactPhone: "" }).success).toBe(
      true,
    );
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, whatsappNumber: "+62 812 3456 789" })
        .success,
    ).toBe(true);
  });

  it("whitelists city and monthlyOrderVolume; unknown values fail", () => {
    expect(waitlistPayloadSchema.safeParse({ ...minimalValid, city: "Jakarta" }).success).toBe(
      true,
    );
    expect(waitlistPayloadSchema.safeParse({ ...minimalValid, city: "Gotham" }).success).toBe(
      false,
    );
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, monthlyOrderVolume: "10-50" }).success,
    ).toBe(true);
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, monthlyOrderVolume: "1000+" }).success,
    ).toBe(false);
    // Empty select values are treated as absent, not unknown.
    const parsed = waitlistPayloadSchema.parse({ ...minimalValid, city: "", monthlyOrderVolume: "" });
    expect(parsed.city).toBeUndefined();
    expect(parsed.monthlyOrderVolume).toBeUndefined();
  });

  it("whitelists currentToolsUsed entries", () => {
    expect(
      waitlistPayloadSchema.safeParse({
        ...minimalValid,
        currentToolsUsed: ["Excel", "WhatsApp Order"],
      }).success,
    ).toBe(true);
    expect(
      waitlistPayloadSchema.safeParse({ ...minimalValid, currentToolsUsed: ["SAP"] }).success,
    ).toBe(false);
  });

  it("clamps array limits like the platform (tools ≤10, brands ≤20×60)", () => {
    const tools = waitlistPayloadSchema.parse({
      ...minimalValid,
      currentToolsUsed: Array(12).fill("Excel"),
    });
    expect(tools.currentToolsUsed).toHaveLength(10);

    const brands = waitlistPayloadSchema.parse({
      ...minimalValid,
      brandsCarried: [...Array(25).fill("Astra"), "x".repeat(100)],
    });
    expect(brands.brandsCarried).toHaveLength(20);
    expect(brands.brandsCarried.every((brand) => brand.length <= 60)).toBe(true);
  });

  it("treats non-array list inputs as empty arrays (platform cleanList)", () => {
    const parsed = waitlistPayloadSchema.parse({
      ...minimalValid,
      currentToolsUsed: "Excel",
      brandsCarried: 42,
    });
    expect(parsed.currentToolsUsed).toEqual([]);
    expect(parsed.brandsCarried).toEqual([]);
  });

  it("clamps businessName to 200 and message to 2000 chars", () => {
    const parsed = waitlistPayloadSchema.parse({
      partnerType: "STORE",
      businessName: "x".repeat(300),
      message: "y".repeat(3000),
    });
    expect(parsed.businessName).toHaveLength(200);
    expect(parsed.message).toHaveLength(2000);
  });

  it("passes a filled _honeypot through so the route can fake success", () => {
    const parsed = waitlistPayloadSchema.parse({
      ...minimalValid,
      _honeypot: "http://spam.example",
    });
    expect(parsed._honeypot).toBe("http://spam.example");
  });
});

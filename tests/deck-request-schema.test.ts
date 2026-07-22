import { describe, expect, it } from "vitest";

import { deckRequestSchema } from "@/lib/deck/schema";

const valid = {
  name: "Ada Lovelace",
  firm: "Analytical Capital",
  email: "Ada@Fund.com",
  linkedin: "https://linkedin.com/in/ada",
  message: "Following SEA commerce infra.",
  lang: "id",
  _honeypot: "",
};

describe("deck request payload validation (F-016)", () => {
  it("accepts a full payload, lowercasing the email", () => {
    const parsed = deckRequestSchema.parse(valid);
    expect(parsed.name).toBe("Ada Lovelace");
    expect(parsed.firm).toBe("Analytical Capital");
    expect(parsed.email).toBe("ada@fund.com");
    expect(parsed.linkedin).toBe("https://linkedin.com/in/ada");
    expect(parsed.lang).toBe("id");
  });

  it("accepts the minimal payload (name/firm/email only), defaulting lang to en", () => {
    const parsed = deckRequestSchema.parse({
      name: "Ada",
      firm: "Fund",
      email: "ada@fund.com",
    });
    expect(parsed.lang).toBe("en");
    expect(parsed.linkedin).toBeUndefined();
    expect(parsed.message).toBeUndefined();
    expect(parsed._honeypot).toBe("");
  });

  it("requires name, firm and a well-formed work email", () => {
    expect(deckRequestSchema.safeParse({ ...valid, name: "  " }).success).toBe(false);
    expect(deckRequestSchema.safeParse({ ...valid, firm: "" }).success).toBe(false);
    expect(deckRequestSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(deckRequestSchema.safeParse({ ...valid, email: "" }).success).toBe(false);
    const noEmail: Partial<typeof valid> = { ...valid };
    delete noEmail.email;
    expect(deckRequestSchema.safeParse(noEmail).success).toBe(false);
  });

  it("treats empty optional fields as absent and clamps long values", () => {
    const parsed = deckRequestSchema.parse({
      ...valid,
      linkedin: "  ",
      message: "x".repeat(3000),
      name: "n".repeat(300),
    });
    expect(parsed.linkedin).toBeUndefined();
    expect(parsed.message).toHaveLength(2000);
    expect(parsed.name).toHaveLength(200);
  });

  it("normalizes a non-string honeypot to empty (waitlist contract)", () => {
    expect(deckRequestSchema.parse({ ...valid, _honeypot: undefined })._honeypot).toBe("");
    expect(deckRequestSchema.parse({ ...valid, _honeypot: 42 })._honeypot).toBe("");
    expect(deckRequestSchema.parse({ ...valid, _honeypot: "bot" })._honeypot).toBe("bot");
  });
});

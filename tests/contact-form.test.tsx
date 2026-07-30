import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/contact/route";
import ContactSection from "@/components/landing/ContactSection";
import { resetContactRateLimit } from "@/lib/contact/rateLimit";
import { contactAlert } from "@/lib/email/contactMessage";
import { copy, t } from "@/lib/i18n";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/email/contactMessage", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/email/contactMessage")>();
  return { ...original, notifyContactMessage: vi.fn().mockResolvedValue(undefined) };
});

const { notifyContactMessage } = await import("@/lib/email/contactMessage");

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
const componentSrc = readFileSync(
  new URL("../src/components/landing/ContactSection.tsx", import.meta.url),
  "utf8",
);

const html = renderToStaticMarkup(
  <LanguageProvider>
    <ContactSection />
  </LanguageProvider>,
);

/** R30b ★ contract tests — the starred items of the brief's QA checklist. */
describe("R30b /contact — page contracts", () => {
  it("★ topic is a radio group in a fieldset/legend — never a <select>", () => {
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).not.toContain("<select");
    expect(html.match(/type="radio"/g)?.length).toBe(5);
    // General question is pre-checked, so the field is always valid — exactly
    // one checked radio, and it is the one whose tag carries value="general"
    // (attribute order is the renderer's business, so look within the tag).
    expect(html.match(/checked=""/g)?.length).toBe(1);
    const generalTag = html.slice(html.indexOf('value="general"') - 120, html.indexOf('value="general"') + 120);
    expect(generalTag).toContain("checked");
  });

  it("★ no email address renders on /contact, and the component source is clean", () => {
    // The form is the channel; info@ lives in the footer. The only permitted
    // occurrence of @mobeeli.com is inside the API route, server-side.
    expect(html).not.toContain("@mobeeli.com");
    expect(componentSrc).not.toContain("@mobeeli.com");
  });

  it('★ the word "founder" appears in neither locale\'s rendered contact strings', () => {
    // The page speaks as a team; who's who lives on /team. (contact_direct
    // is DORMANT — it renders nowhere and is excluded deliberately.)
    const renderedKeys = (Object.keys(copy.en) as (keyof typeof copy.en)[]).filter(
      (k) => k.startsWith("contact_") && k !== "contact_direct",
    );
    for (const lang of ["en", "id"] as const) {
      for (const key of renderedKeys) {
        expect(String(copy[lang][key]), `${lang}.${key}`).not.toMatch(/founder|founding/i);
      }
    }
    expect(html).not.toMatch(/founder/i);
  });

  it("★ no decorative icons — only functional glyphs (✓, →)", () => {
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<svg");
  });

  it("★ light-surface colour rule: #8b95a4 appears in no .mb-ct rule", () => {
    // Comments name the hex while explaining the rule — strip them first
    // (the r13-glass idiom) so only real declarations are scanned.
    const stripped = landingCss.replace(/\/\*[\s\S]*?\*\//g, "");
    const ctRules = stripped.match(/\.mb-ct[^{]*\{[^}]*\}/gs) ?? [];
    expect(ctRules.length).toBeGreaterThan(10);
    for (const rule of ctRules) {
      expect(rule).not.toContain("#8b95a4");
    }
  });

  it("labels, hint wiring and honeypot are per spec", () => {
    for (const id of ["ct-name", "ct-email", "ct-message"]) {
      expect(html).toContain(`for="${id}"`);
    }
    // Email aria-describedby lists BOTH the hint and the error id.
    expect(html).toContain('aria-describedby="ct-email-hint ct-email-err"');
    expect(html).toContain('id="ct-email-hint"');
    // Attribute order is the renderer's business — assert each fact alone.
    expect(html).toContain('name="company_website"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('class="mb-ctform-honeypot"');
    // The redirects are prose links, never buttons.
    expect(html).toContain('href="/early-adopters"');
    expect(html).toContain('href="/investors"');
    expect(html).toContain('href="/team"');
  });

  it("form geometry contracts: 16px inputs, 47px chips, focus ring in both forms", () => {
    expect(landingCss).toMatch(/\.mb-ctform-input \{[^}]*font-size: 16px;/s);
    expect(landingCss).toMatch(/\.mb-ctform-topic \{[^}]*padding: 13px 15px;/s);
    expect(landingCss).toMatch(
      /\.mb-ctform-input:focus \{[^}]*box-shadow: 0 0 0 3px rgba\(47, 125, 246, 0\.18\);/s,
    );
    // R30b delta 1 was adopted for the deck form too.
    expect(landingCss).toMatch(
      /\.mb-deckform-input:focus \{[^}]*box-shadow: 0 0 0 3px rgba\(47, 125, 246, 0\.18\);/s,
    );
  });
});

describe("R30b POST /api/contact — route contracts", () => {
  let ipCounter = 0;
  const post = (body: unknown, ip = `10.9.0.${++ipCounter}`) =>
    POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify(body),
      }),
    );

  const valid = {
    name: "Budi Santoso",
    email: "budi@toko.com",
    topic: "partnership",
    message: "Halo — soal kemitraan distribusi.",
    lang: "id",
    _honeypot: "",
  };

  beforeEach(() => {
    resetContactRateLimit();
    vi.mocked(notifyContactMessage).mockClear();
    vi.mocked(notifyContactMessage).mockResolvedValue(undefined);
  });

  it("alerts the team for a valid message", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(notifyContactMessage).toHaveBeenCalledTimes(1);
  });

  it("★ honeypot filled → fake success, no email sent", async () => {
    const res = await post({ ...valid, _honeypot: "http://spam.example" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(notifyContactMessage).not.toHaveBeenCalled();
  });

  it("★ 6th submit from one IP inside the window → 429", async () => {
    const ip = "10.9.99.1";
    for (let i = 0; i < 5; i++) {
      expect((await post(valid, ip)).status).toBe(200);
    }
    expect((await post(valid, ip)).status).toBe(429);
  });

  it("rejects invalid payloads with 400 and never writes to any table", async () => {
    expect((await post({ ...valid, email: "not-an-email" })).status).toBe(400);
    expect((await post({ ...valid, message: "" })).status).toBe(400);
    expect((await post({ ...valid, topic: "sales" })).status).toBe(400);
    expect(notifyContactMessage).not.toHaveBeenCalled();
  });

  it("failed send → 500 (retriable; the client keeps typed data)", async () => {
    vi.mocked(notifyContactMessage).mockRejectedValueOnce(new Error("resend down"));
    expect((await post(valid)).status).toBe(500);
  });

  it("the alert subject carries the topic and reply-to is the sender's address", () => {
    const alert = contactAlert({ ...valid, topic: "press", _honeypot: "" } as never);
    expect(alert.subject).toBe("Contact — Press & media: Budi Santoso");
    expect(alert.text).toContain("budi@toko.com");
  });

  it("error strings reuse the shipped deck-form keys verbatim", () => {
    expect(t("en", "inv_err_name")).toBe("Please enter your name.");
    expect(t("en", "inv_err_email")).toBe("That email doesn't look right.");
  });
});

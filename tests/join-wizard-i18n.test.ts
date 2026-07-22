import { describe, expect, it } from "vitest";

import { copy, langs } from "@/lib/i18n";

/**
 * Wizard copy completeness (F-007): every key of the approved Join Waitlist
 * TXT map (jw_-prefixed in the copy maps) plus the promoted/interpolation and
 * submit-state keys must exist non-empty in BOTH languages.
 */
const WIZARD_KEYS = [
  // Join Waitlist.dc.html TXT map, verbatim
  "jw_back_home",
  "jw_offer",
  "jw_left_h",
  "jw_left_sub",
  "jw_ben1_t",
  "jw_ben1_s",
  "jw_ben2_t",
  "jw_ben2_s",
  "jw_ben3_t",
  "jw_ben3_s",
  "jw_trust",
  "jw_eyebrow",
  "jw_introTitle",
  "jw_introBody",
  "jw_start",
  "jw_minutes",
  "jw_stepType",
  "jw_stepBusiness",
  "jw_stepContact",
  "jw_stepDetails",
  "jw_qType",
  "jw_qBusiness",
  "jw_qContact",
  "jw_qDetails",
  "jw_typeStore",
  "jw_typeStoreSub",
  "jw_typeGarage",
  "jw_typeGarageSub",
  "jw_typeDist",
  "jw_typeDistSub",
  "jw_contactName",
  "jw_email",
  "jw_contactPhone",
  "jw_whatsapp",
  "jw_city",
  "jw_pickCity",
  "jw_cityOther",
  "jw_volume",
  "jw_pickVolume",
  "jw_toolsUsed",
  "jw_brands",
  "jw_brandsPh",
  "jw_net30",
  "jw_message",
  "jw_back",
  "jw_next",
  "jw_submit",
  "jw_bizStore",
  "jw_bizGarage",
  "jw_bizDist",
  "jw_bizPhStore",
  "jw_bizPhGarage",
  "jw_bizPhDist",
  "jw_errBiz",
  "jw_errEmail",
  "jw_errPhone",
  "jw_successTitle",
  "jw_succBody",
  "jw_emailCta",
  "jw_homeCta",
  // promoted design-hardcoded strings + interpolation + submit states
  "jw_ph_email",
  "jw_ph_phone",
  "jw_fallback_name",
  "jw_mail_subject",
  "jw_mail_body",
  "jw_submitting",
  "jw_submitErr",
] as const;

describe("join wizard i18n completeness", () => {
  it("has every wizard key non-empty in both en and id", () => {
    for (const lang of langs) {
      const map: Record<string, string> = copy[lang];
      for (const key of WIZARD_KEYS) {
        expect(map[key], `${lang}.${key}`).toBeTypeOf("string");
        expect(map[key].trim(), `${lang}.${key}`).not.toBe("");
      }
    }
  });

  it("keeps the {n} interpolation slot in both languages", () => {
    for (const lang of langs) {
      expect(copy[lang].jw_succBody).toContain("{n}");
      expect(copy[lang].jw_mail_subject).toContain("{n}");
      expect(copy[lang].jw_mail_body).toContain("{n}");
    }
  });

  it("translates the type-adaptive business labels differently per language", () => {
    expect(copy.en.jw_bizStore).not.toBe(copy.id.jw_bizStore);
    expect(copy.en.jw_bizGarage).not.toBe(copy.id.jw_bizGarage);
    expect(copy.en.jw_bizDist).not.toBe(copy.id.jw_bizDist);
  });
});

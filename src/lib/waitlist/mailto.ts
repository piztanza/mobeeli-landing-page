import { t, type Lang } from "@/lib/i18n";

/** Success panel contact address — the approved info@ address (F-009). */
export const WAITLIST_MAILTO_ADDRESS = "info@mobeeli.com";

/**
 * Builds the success panel's prefilled mailto link (C-021): info@mobeeli.com
 * with the language-appropriate subject and body from the copy map, both
 * personalized with the submitted business name and URL-encoded.
 */
export function buildMailtoLink(businessName: string, lang: Lang): string {
  const name = businessName.trim() || t(lang, "jw_fallback_name");
  const subject = t(lang, "jw_mail_subject").replace("{n}", name);
  const body = t(lang, "jw_mail_body").replace("{n}", name);
  return `mailto:${WAITLIST_MAILTO_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

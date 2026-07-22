import { t, type Lang } from "@/lib/i18n";

/** Default founder WhatsApp number from the approved design's props (whatsapp: 6281234567890). */
export const DEFAULT_WHATSAPP_NUMBER = "6281234567890";

/**
 * Builds the success panel's wa.me deep link (C-021): configured founder number
 * (NEXT_PUBLIC_WHATSAPP_NUMBER, design default when unset), submitted business
 * name, and the language-appropriate prefilled message from the copy map.
 */
export function buildWaLink(businessName: string, lang: Lang, number?: string): string {
  const raw = number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER;
  const digits = raw.replace(/[^0-9]/g, "") || DEFAULT_WHATSAPP_NUMBER;
  const name = businessName.trim() || t(lang, "jw_fallback_name");
  const message = t(lang, "jw_wa_msg").replace("{n}", name);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

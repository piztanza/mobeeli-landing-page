"use client";

import { useEffect, useRef, useState } from "react";

import { useGlowCards } from "@/lib/hooks/useGlowCards";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

/* Same client-side email check as the waitlist wizard / server schema. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Buyer strip (F-015, CHG-piztanza-13) — tinted band whose "get notified" CTA
 * expands an inline one-field email capture (no navigation; the old F-009
 * mailto is superseded). Submits to POST /api/notify with a honeypot; inline
 * bilingual success/error states. The expand animation is gated on the central
 * reduced-motion hook — reduced motion expands instantly.
 */
export default function BuyerStrip() {
  const { lang } = useLang();
  const t = useT();
  const reducedMotion = useReducedMotion();
  const glowRef = useGlowCards<HTMLElement>();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorKey, setErrorKey] = useState<CopyKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Move focus into the revealed field so keyboard users land in it directly.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = async () => {
    setSubmitting(true);
    setErrorKey(null);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // lang only picks reporting in the fallback alert — never stored.
        body: JSON.stringify({ email: email.trim(), lang, _honeypot: honeypot }),
      });
      if (res.status === 400) {
        setErrorKey("buyer_err_email");
        return;
      }
      if (!res.ok) throw new Error(`notify failed: ${res.status}`);
      setSuccess(true);
    } catch {
      // Retriable — the entered address stays in state.
      setErrorKey("buyer_err_fail");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="waitlist" ref={glowRef} className="mb-buyer">
      <div className="mb-buyer-inner mb-glow-card">
        <div className="mb-buyer-line">{t("buyer_line")}</div>
        {success ? (
          <div className="mb-buyer-success" role="status">
            {t("buyer_success")}
          </div>
        ) : !open ? (
          <button
            type="button"
            className="mb-buyer-cta mb-btn-spring"
            aria-expanded={false}
            onClick={() => setOpen(true)}
          >
            {t("buyer_cta")}
          </button>
        ) : (
          <form
            className={`mb-buyer-form${reducedMotion ? " is-instant" : ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              if (!EMAIL_RE.test(email.trim())) {
                setErrorKey("buyer_err_email");
                return;
              }
              void submit();
            }}
          >
            {/* Honeypot — humans never see it; anything typed here flags the submission as spam. */}
            <input
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              className="mb-buyer-honeypot"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="email"
              maxLength={200}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrorKey(null);
              }}
              className={`mb-buyer-input${errorKey ? " is-invalid" : ""}`}
              placeholder={t("buyer_email_ph")}
              aria-label={t("buyer_email_label")}
              aria-invalid={Boolean(errorKey)}
            />
            <button
              type="submit"
              className="mb-buyer-cta mb-buyer-send mb-btn-spring"
              disabled={submitting}
            >
              {submitting ? t("buyer_sending") : t("buyer_send")}
            </button>
            {errorKey && (
              <div className="mb-buyer-err" role="alert">
                {t(errorKey)}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";

import type { CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

/* Same client-side email check as the waitlist wizard / server schema. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Fields {
  name: string;
  firm: string;
  email: string;
  linkedin: string;
  message: string;
}

const EMPTY_FIELDS: Fields = { name: "", firm: "", email: "", linkedin: "", message: "" };

type ErrorField = "name" | "firm" | "email";

/**
 * Bilingual deck-request form on /investors (F-016): name, firm/fund and work
 * email required with inline validation; LinkedIn/website and message
 * optional; honeypot. Submits to POST /api/deck-request; the success panel
 * confirms a personal follow-up, failures show a retriable bilingual error
 * with all entered data preserved.
 */
export default function DeckRequestForm() {
  const { lang } = useLang();
  const t = useT();

  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ErrorField, CopyKey>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (name: keyof Fields) => (event: ChangeEvent<HTMLElement & { value: string }>) => {
    setFields((prev) => ({ ...prev, [name]: event.target.value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<ErrorField, CopyKey>> = {};
    if (!fields.name.trim()) next.name = "inv_err_name";
    if (!fields.firm.trim()) next.firm = "inv_err_firm";
    if (!EMAIL_RE.test(fields.email.trim())) next.email = "inv_err_email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitFailed(false);
    try {
      const res = await fetch("/api/deck-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          firm: fields.firm.trim(),
          email: fields.email.trim(),
          linkedin: fields.linkedin.trim(),
          message: fields.message.trim(),
          // lang only picks reporting in the team alert — never stored.
          lang,
          _honeypot: honeypot,
        }),
      });
      if (!res.ok) throw new Error(`deck request failed: ${res.status}`);
      setSuccess(true);
    } catch {
      // Retriable — entered data stays in state.
      setSubmitFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mb-deckform mb-deckform-success" role="status">
        <div className="mb-deckform-badge" aria-hidden>
          {"✓"}
        </div>
        <h3 className="mb-deckform-success-h">{t("inv_success_h")}</h3>
        <p className="mb-deckform-success-p">{t("inv_success_p")}</p>
      </div>
    );
  }

  const inputClass = (field: ErrorField) => `mb-deckform-input${errors[field] ? " is-invalid" : ""}`;

  return (
    <form
      className="mb-deckform"
      onSubmit={(event) => {
        event.preventDefault();
        if (validate()) void submit();
      }}
    >
      {/* Honeypot — humans never see it; anything typed here flags the submission as spam. */}
      <input
        type="text"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        className="mb-deckform-honeypot"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <div className="mb-deckform-grid">
        <div>
          <label className="mb-deckform-label" htmlFor="deck-name">
            {t("inv_f_name")}
          </label>
          <input
            id="deck-name"
            type="text"
            maxLength={200}
            value={fields.name}
            onChange={setField("name")}
            className={inputClass("name")}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <div className="mb-deckform-err">{t(errors.name)}</div>}
        </div>
        <div>
          <label className="mb-deckform-label" htmlFor="deck-firm">
            {t("inv_f_firm")}
          </label>
          <input
            id="deck-firm"
            type="text"
            maxLength={200}
            value={fields.firm}
            onChange={setField("firm")}
            className={inputClass("firm")}
            aria-invalid={Boolean(errors.firm)}
          />
          {errors.firm && <div className="mb-deckform-err">{t(errors.firm)}</div>}
        </div>
        <div>
          <label className="mb-deckform-label" htmlFor="deck-email">
            {t("inv_f_email")}
          </label>
          <input
            id="deck-email"
            type="email"
            maxLength={200}
            value={fields.email}
            onChange={setField("email")}
            className={inputClass("email")}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <div className="mb-deckform-err">{t(errors.email)}</div>}
        </div>
        <div>
          <label className="mb-deckform-label" htmlFor="deck-linkedin">
            {t("inv_f_linkedin")}
          </label>
          <input
            id="deck-linkedin"
            type="text"
            maxLength={300}
            value={fields.linkedin}
            onChange={setField("linkedin")}
            className="mb-deckform-input"
          />
        </div>
        <div className="mb-deckform-full">
          <label className="mb-deckform-label" htmlFor="deck-message">
            {t("inv_f_message")}
          </label>
          <textarea
            id="deck-message"
            rows={3}
            maxLength={2000}
            value={fields.message}
            onChange={setField("message")}
            className="mb-deckform-input mb-deckform-textarea"
          />
        </div>
      </div>

      {submitFailed && (
        <div className="mb-deckform-err mb-deckform-submit-err" role="alert">
          {t("inv_f_fail")}
        </div>
      )}

      <button type="submit" className="mb-btn-primary-dark mb-deckform-send" disabled={submitting}>
        {submitting ? t("inv_f_sending") : t("inv_f_send")}
      </button>
    </form>
  );
}

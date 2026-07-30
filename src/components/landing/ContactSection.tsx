"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";

import { CONTACT_TOPICS, type ContactTopic } from "@/lib/contact/schema";
import type { CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

/* Same client-side email check as the waitlist wizard / server schema. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const TOPIC_KEYS: Record<ContactTopic, CopyKey> = {
  general: "contact_t_general",
  partnership: "contact_t_partnership",
  press: "contact_t_press",
  supplier: "contact_t_supplier",
  investor: "contact_t_investor",
};

interface Fields {
  name: string;
  email: string;
  message: string;
}

const EMPTY_FIELDS: Fields = { name: "", email: "", message: "" };

type ErrorField = keyof Fields;
const FIELD_ORDER: readonly ErrorField[] = ["name", "email", "message"];

/**
 * R30b /contact — CD option 4a, founder-overruled from mailto-first to a
 * message form. The boundary from the commission holds: this is a MESSAGE,
 * never a sign-up — no waitlist fields, no "join" framing; the shop and
 * investor redirects are prose links, never buttons.
 *
 * ★ contract facts (tested): no email address renders anywhere on this page
 * (the form is the channel; info@ lives in the footer) and the word
 * "founder" appears nowhere in the contact keys — the page speaks as a team.
 * Topic is a radio GROUP (all five options visible, General pre-checked, so
 * the field is always valid), not a <select>. Validation runs on blur and on
 * submit — never on keystroke; a failed submit focuses the first invalid
 * field and typed data is never lost.
 */
export default function ContactSection() {
  const { lang } = useLang();
  const t = useT();

  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [topic, setTopic] = useState<ContactTopic>("general");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ErrorField, CopyKey>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const refs: Record<ErrorField, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
    name: nameRef,
    email: emailRef,
    message: messageRef,
  };

  const setField = (name: ErrorField) => (event: ChangeEvent<HTMLElement & { value: string }>) => {
    setFields((prev) => ({ ...prev, [name]: event.target.value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const fieldError = (name: ErrorField, value: Fields): CopyKey | undefined => {
    if (name === "name" && !value.name.trim()) return "inv_err_name";
    if (name === "email" && !EMAIL_RE.test(value.email.trim())) return "inv_err_email";
    if (name === "message" && !value.message.trim()) return "contact_err_message";
    return undefined;
  };

  /** Blur validation (R30b §2) — a field, on leaving it. Never on keystroke. */
  const validateOnBlur = (name: ErrorField) => () => {
    setErrors((prev) => ({ ...prev, [name]: fieldError(name, fields) }));
  };

  const validateAll = (): boolean => {
    const next: Partial<Record<ErrorField, CopyKey>> = {};
    for (const name of FIELD_ORDER) {
      const err = fieldError(name, fields);
      if (err) next[name] = err;
    }
    setErrors(next);
    const first = FIELD_ORDER.find((name) => next[name]);
    if (first) refs[first].current?.focus();
    return !first;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          topic,
          message: fields.message.trim(),
          // lang only picks reporting in the team alert — never stored.
          lang,
          _honeypot: honeypot,
        }),
      });
      if (!res.ok) throw new Error(`contact failed: ${res.status}`);
      setSuccess(true);
    } catch {
      // Retriable — entered data stays in state (429 and network alike).
      setSubmitFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFields(EMPTY_FIELDS);
    setTopic("general");
    setHoneypot("");
    setErrors({});
    setSubmitFailed(false);
    setSuccess(false);
  };

  const inputClass = (field: ErrorField) => `mb-ctform-input${errors[field] ? " is-invalid" : ""}`;

  return (
    <section id="contact" className="mb-ct">
      <div className="mb-ct-container">
        <div className="mb-ct-left" data-rev="0">
          <div className="mb-ct-kicker">{t("contact_kicker")}</div>
          <h2 className="mb-ct-h2">{t("contact_h2")}</h2>
          <p className="mb-ct-lede">{t("contact_p")}</p>

          <div className="mb-ct-next">
            <div className="mb-ct-next-h">{t("contact_next_h")}</div>
            {(["contact_next_1", "contact_next_2", "contact_next_3"] as const).map((key, i) => (
              <div key={key} className="mb-ct-next-row">
                <span className="mb-ct-next-i" aria-hidden>
                  {`0${i + 1}`}
                </span>
                <span className="mb-ct-next-t">{t(key)}</span>
              </div>
            ))}
            <Link href="/team" className="mb-ct-next-link">
              {t("contact_next_link")}
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* The boundary made visible: prose links, never buttons. */}
          <p className="mb-ct-ramps">
            {t("contact_ramps_a")} <Link href="/early-adopters">{t("contact_ramps_a_link")}</Link>{" "}
            {t("contact_ramps_a_end")} {t("contact_ramps_b")}{" "}
            <Link href="/investors">{t("contact_ramps_b_link")}</Link>.
          </p>

          <p className="mb-ct-place">{t("contact_place_note")}</p>
        </div>

        <div className="mb-ct-card" data-rev="1">
          {success ? (
            <div className="mb-ct-sent" role="status" aria-live="polite">
              <div className="mb-ct-sent-badge" aria-hidden>
                {"✓"}
              </div>
              <h3 className="mb-ct-sent-h">{t("contact_sent_h")}</h3>
              <p className="mb-ct-sent-p">{t("contact_sent_p")}</p>
              <button type="button" className="mb-ct-again" onClick={reset}>
                {t("contact_sent_again")}
              </button>
              <p className="mb-ct-sent-urgent">{t("contact_sent_urgent")}</p>
            </div>
          ) : (
            <>
              <h3 className="mb-ct-form-h">{t("contact_form_h")}</h3>
              <form
                className="mb-ctform"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitFailed(false);
                  if (validateAll()) void submit();
                }}
              >
                <div className="mb-ctform-field">
                  <label className="mb-ctform-label" htmlFor="ct-name">
                    {t("contact_f_name")}
                  </label>
                  <input
                    id="ct-name"
                    ref={nameRef}
                    type="text"
                    maxLength={200}
                    autoComplete="name"
                    placeholder={t("contact_ph_name")}
                    value={fields.name}
                    onChange={setField("name")}
                    onBlur={validateOnBlur("name")}
                    className={inputClass("name")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "ct-name-err" : undefined}
                  />
                  {errors.name && (
                    <div id="ct-name-err" className="mb-ctform-err" role="alert">
                      {t(errors.name)}
                    </div>
                  )}
                </div>

                <div className="mb-ctform-field">
                  <label className="mb-ctform-label" htmlFor="ct-email">
                    {t("contact_f_email")}
                  </label>
                  <input
                    id="ct-email"
                    ref={emailRef}
                    type="email"
                    maxLength={200}
                    autoComplete="email"
                    placeholder={t("contact_ph_email")}
                    value={fields.email}
                    onChange={setField("email")}
                    onBlur={validateOnBlur("email")}
                    className={inputClass("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby="ct-email-hint ct-email-err"
                  />
                  {/* The page's purpose statement for the data it collects
                      (R30b §7.1 — no privacy page exists; do not link one
                      before it does). */}
                  <div id="ct-email-hint" className="mb-ctform-hint">
                    {t("contact_email_hint")}
                  </div>
                  {errors.email && (
                    <div id="ct-email-err" className="mb-ctform-err" role="alert">
                      {t(errors.email)}
                    </div>
                  )}
                </div>

                {/* Topic is a radio GROUP, not a <select> (founder question,
                    answered): all five options visible, native keyboard
                    arrows, no OS wheel on mobile. General pre-checked. */}
                <fieldset className="mb-ctform-topics">
                  <legend className="mb-ctform-label">{t("contact_f_topic")}</legend>
                  <div className="mb-ctform-topic-row">
                    {CONTACT_TOPICS.map((value) => (
                      <label key={value} className="mb-ctform-topic">
                        <input
                          type="radio"
                          name="topic"
                          value={value}
                          checked={topic === value}
                          onChange={() => setTopic(value)}
                        />
                        {t(TOPIC_KEYS[value])}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mb-ctform-field">
                  <label className="mb-ctform-label" htmlFor="ct-message">
                    {t("contact_f_message")}
                  </label>
                  <textarea
                    id="ct-message"
                    ref={messageRef}
                    rows={5}
                    maxLength={2000}
                    placeholder={t("contact_ph_message")}
                    value={fields.message}
                    onChange={setField("message")}
                    onBlur={validateOnBlur("message")}
                    className={`${inputClass("message")} mb-ctform-textarea`}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "ct-message-err" : undefined}
                  />
                  {errors.message && (
                    <div id="ct-message-err" className="mb-ctform-err" role="alert">
                      {t(errors.message)}
                    </div>
                  )}
                </div>

                {/* Honeypot — humans never see it. */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  className="mb-ctform-honeypot"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                />

                {submitFailed && (
                  <div className="mb-ctform-fail" role="alert">
                    {t("contact_f_fail")}
                  </div>
                )}

                <div className="mb-ctform-actions">
                  <button type="submit" className="mb-ctform-send" disabled={submitting}>
                    {submitting ? t("inv_f_sending") : t("contact_f_send")}
                  </button>
                  <span className="mb-ctform-note">{t("contact_f_note")}</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

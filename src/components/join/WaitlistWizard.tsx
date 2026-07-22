"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";
import { CITY_OPTIONS, GARAGE_TOOLS, VOLUME_OPTIONS } from "@/lib/waitlist/constants";
import type { BusinessType } from "@/lib/waitlist/schema";
import { buildWaLink } from "@/lib/waitlist/whatsapp";

/* Client-side format checks — same expressions as the approved design's script. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[+0-9 -]{6,20}$/;
const LAST_STEP = 4;
/** Type-pick auto-advance / autofocus delay from the design (matches the slide duration). */
const ADVANCE_MS = 260;

interface Fields {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  city: string;
  monthlyOrderVolume: string;
  brandsCarried: string;
  message: string;
}

const EMPTY_FIELDS: Fields = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  whatsappNumber: "",
  city: "",
  monthlyOrderVolume: "",
  brandsCarried: "",
  message: "",
};

type ErrorField = "businessName" | "email" | "phone" | "whatsappNumber";

const TYPE_OPTIONS: readonly {
  type: BusinessType;
  glyph: string;
  title: CopyKey;
  sub: CopyKey;
}[] = [
  { type: "store", glyph: "◧", title: "jw_typeStore", sub: "jw_typeStoreSub" },
  { type: "garage", glyph: "⚙", title: "jw_typeGarage", sub: "jw_typeGarageSub" },
  { type: "distributor", glyph: "▦", title: "jw_typeDist", sub: "jw_typeDistSub" },
];

/** Type-adaptive business-name label + placeholder keys (design's bizLabel logic). */
function bizKeys(type: BusinessType | null): { label: CopyKey; placeholder: CopyKey } {
  if (type === "garage") return { label: "jw_bizGarage", placeholder: "jw_bizPhGarage" };
  if (type === "distributor") return { label: "jw_bizDist", placeholder: "jw_bizPhDist" };
  return { label: "jw_bizStore", placeholder: "jw_bizPhStore" };
}

/**
 * Waitlist wizard (C-018, F-007): intro + 4 steps with progress bar, slide
 * transitions, per-type field adaptation, inline bilingual validation and a
 * honeypot. Submits to POST /api/waitlist and only shows the success panel
 * (C-020) after the server confirms persistence; failures show a retriable
 * bilingual error with all entered data preserved.
 */
export default function WaitlistWizard() {
  const { lang } = useLang();
  const t = useT();
  const reducedMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [type, setType] = useState<BusinessType | null>(null);
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [tools, setTools] = useState<readonly string[]>([]);
  const [net30, setNet30] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ErrorField, CopyKey>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const stepRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimeout(advanceTimer.current ?? undefined), []);

  // Per-step autofocus (design: steps beyond the type picker, after the slide).
  useEffect(() => {
    if (step < 2) return;
    const timer = setTimeout(() => {
      stepRef.current?.querySelector<HTMLInputElement>("[data-autofocus]")?.focus();
    }, ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [step]);

  const goTo = (next: number, direction: 1 | -1) => {
    setDir(direction);
    setStep(next);
  };

  const setField = (name: keyof Fields) => (event: ChangeEvent<HTMLElement & { value: string }>) => {
    setFields((prev) => ({ ...prev, [name]: event.target.value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const pickType = (picked: BusinessType) => {
    setType(picked);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goTo(2, 1), ADVANCE_MS);
  };

  const toggleTool = (tool: string) => {
    setTools((prev) => (prev.includes(tool) ? prev.filter((x) => x !== tool) : [...prev, tool]));
  };

  const validate = (): boolean => {
    const next: Partial<Record<ErrorField, CopyKey>> = {};
    if (step === 2 && !fields.businessName.trim()) next.businessName = "jw_errBiz";
    if (step === 3) {
      const email = fields.email.trim();
      if (email && !EMAIL_RE.test(email)) next.email = "jw_errEmail";
      const phone = fields.phone.trim();
      if (phone && !PHONE_RE.test(phone)) next.phone = "jw_errPhone";
      const wa = fields.whatsappNumber.trim();
      if (wa && !PHONE_RE.test(wa)) next.whatsappNumber = "jw_errPhone";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!type) return;
    setSubmitting(true);
    setSubmitFailed(false);
    const payload = {
      type,
      businessName: fields.businessName.trim(),
      contactName: fields.contactName.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      whatsappNumber: fields.whatsappNumber.trim(),
      city: fields.city,
      monthlyOrderVolume: fields.monthlyOrderVolume,
      // Mirror the per-type UI: tools for garages, brands otherwise.
      toolsUsed: type === "garage" ? tools.join(", ") : "",
      brandsCarried: type !== "garage" ? fields.brandsCarried.trim() : "",
      net30Interest: net30,
      message: fields.message.trim(),
      lang,
      website: honeypot,
    };
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`waitlist submit failed: ${res.status}`);
      setSuccess(true);
      try {
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      } catch {
        /* older browsers without options support */
      }
    } catch {
      // Retriable — entered data stays in state.
      setSubmitFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = () => {
    if (!validate()) return;
    if (step === LAST_STEP) {
      void submit();
      return;
    }
    goTo(step + 1, 1);
  };

  if (success) {
    const name = fields.businessName.trim() || t("jw_fallback_name");
    return (
      <div className="mb-jw-success">
        <div className="mb-jw-success-badge" aria-hidden>
          {"✓"}
        </div>
        <h2 className="mb-jw-success-h2">{t("jw_successTitle")}</h2>
        <p className="mb-jw-success-body">{t("jw_succBody").replace("{n}", name)}</p>
        <div className="mb-jw-success-ctas">
          <a
            href={buildWaLink(fields.businessName, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-jw-wa-cta"
          >
            {t("jw_waCta")}
          </a>
          <Link href="/" className="mb-jw-home-cta">
            {t("jw_homeCta")}
          </Link>
        </div>
      </div>
    );
  }

  const biz = bizKeys(type);
  const inputClass = (field: ErrorField) => `mb-jw-input${errors[field] ? " is-invalid" : ""}`;

  return (
    <form
      className="mb-jw-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (step > 0) onNext();
      }}
    >
      <div className="mb-jw-prog-wrap" hidden={step === 0}>
        <div className="mb-jw-prog" style={{ width: `${(step / LAST_STEP) * 100}%` }} />
      </div>
      <div className="mb-jw-card-inner">
        {/* Honeypot — humans never see it; anything typed here flags the submission as spam. */}
        <input
          type="text"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          className="mb-jw-honeypot"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

        <div
          key={step}
          ref={stepRef}
          className={`mb-jw-step${reducedMotion ? "" : dir > 0 ? " is-fwd" : " is-back"}`}
        >
          {step === 0 && (
            <div className="mb-jw-intro">
              <div className="mb-jw-eyebrow">{t("jw_eyebrow")}</div>
              <h2 className="mb-jw-intro-h2">{t("jw_introTitle")}</h2>
              <p className="mb-jw-intro-body">{t("jw_introBody")}</p>
              <button type="button" className="mb-jw-start" onClick={() => goTo(1, 1)}>
                {t("jw_start")}
              </button>
              <div className="mb-jw-minutes">{t("jw_minutes")}</div>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="mb-jw-stephead">
                <div className="mb-jw-stepkicker">
                  <span>1/4</span> <span className="mb-jw-stepname">{t("jw_stepType")}</span>
                </div>
                <h3 className="mb-jw-q">{t("jw_qType")}</h3>
              </div>
              <div className="mb-jw-typegrid">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    className={`mb-jw-type${type === option.type ? " is-selected" : ""}`}
                    aria-pressed={type === option.type}
                    onClick={() => pickType(option.type)}
                  >
                    <span className="mb-jw-type-glyph" aria-hidden>
                      {option.glyph}
                    </span>
                    <span>
                      <span className="mb-jw-type-t">{t(option.title)}</span>
                      <span className="mb-jw-type-s">{t(option.sub)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-jw-stephead">
                <div className="mb-jw-stepkicker">
                  <span>2/4</span> <span className="mb-jw-stepname">{t("jw_stepBusiness")}</span>
                </div>
                <h3 className="mb-jw-q">{t("jw_qBusiness")}</h3>
              </div>
              <div className="mb-jw-fields">
                <div>
                  <label className="mb-jw-label" htmlFor="jw-businessName">
                    {t(biz.label)}
                  </label>
                  <input
                    id="jw-businessName"
                    data-autofocus
                    type="text"
                    maxLength={200}
                    placeholder={t(biz.placeholder)}
                    value={fields.businessName}
                    onChange={setField("businessName")}
                    className={inputClass("businessName")}
                    aria-invalid={Boolean(errors.businessName)}
                  />
                  {errors.businessName && (
                    <div className="mb-jw-err">{t(errors.businessName)}</div>
                  )}
                </div>
                <div>
                  <label className="mb-jw-label" htmlFor="jw-contactName">
                    {t("jw_contactName")}
                  </label>
                  <input
                    id="jw-contactName"
                    type="text"
                    maxLength={200}
                    value={fields.contactName}
                    onChange={setField("contactName")}
                    className="mb-jw-input"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-jw-stephead">
                <div className="mb-jw-stepkicker">
                  <span>3/4</span> <span className="mb-jw-stepname">{t("jw_stepContact")}</span>
                </div>
                <h3 className="mb-jw-q">{t("jw_qContact")}</h3>
              </div>
              <div className="mb-jw-fields">
                <div>
                  <label className="mb-jw-label" htmlFor="jw-email">
                    {t("jw_email")}
                  </label>
                  <input
                    id="jw-email"
                    data-autofocus
                    type="email"
                    maxLength={200}
                    placeholder={t("jw_ph_email")}
                    value={fields.email}
                    onChange={setField("email")}
                    className={inputClass("email")}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <div className="mb-jw-err">{t(errors.email)}</div>}
                </div>
                <div className="mb-jw-grid2">
                  <div>
                    <label className="mb-jw-label" htmlFor="jw-phone">
                      {t("jw_contactPhone")}
                    </label>
                    <input
                      id="jw-phone"
                      type="tel"
                      maxLength={30}
                      placeholder={t("jw_ph_phone")}
                      value={fields.phone}
                      onChange={setField("phone")}
                      className={inputClass("phone")}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <div className="mb-jw-err">{t(errors.phone)}</div>}
                  </div>
                  <div>
                    <label className="mb-jw-label" htmlFor="jw-whatsapp">
                      {t("jw_whatsapp")}
                    </label>
                    <input
                      id="jw-whatsapp"
                      type="tel"
                      maxLength={30}
                      placeholder={t("jw_ph_phone")}
                      value={fields.whatsappNumber}
                      onChange={setField("whatsappNumber")}
                      className={inputClass("whatsappNumber")}
                      aria-invalid={Boolean(errors.whatsappNumber)}
                    />
                    {errors.whatsappNumber && (
                      <div className="mb-jw-err">{t(errors.whatsappNumber)}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-jw-label" htmlFor="jw-city">
                    {t("jw_city")}
                  </label>
                  <select
                    id="jw-city"
                    value={fields.city}
                    onChange={setField("city")}
                    className="mb-jw-input mb-jw-select"
                  >
                    <option value="">{t("jw_pickCity")}</option>
                    {CITY_OPTIONS.map((city) => (
                      <option key={city} value={city}>
                        {city === "Other" ? t("jw_cityOther") : city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="mb-jw-stephead">
                <div className="mb-jw-stepkicker">
                  <span>4/4</span> <span className="mb-jw-stepname">{t("jw_stepDetails")}</span>
                </div>
                <h3 className="mb-jw-q">{t("jw_qDetails")}</h3>
              </div>
              <div className="mb-jw-fields mb-jw-fields--details">
                <div>
                  <label className="mb-jw-label" htmlFor="jw-volume">
                    {t("jw_volume")}
                  </label>
                  <select
                    id="jw-volume"
                    value={fields.monthlyOrderVolume}
                    onChange={setField("monthlyOrderVolume")}
                    className="mb-jw-input mb-jw-select"
                  >
                    <option value="">{t("jw_pickVolume")}</option>
                    {VOLUME_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {type === "garage" ? (
                  <div>
                    <div className="mb-jw-label">{t("jw_toolsUsed")}</div>
                    <div className="mb-jw-toolswrap">
                      {GARAGE_TOOLS.map((tool) => (
                        <button
                          key={tool}
                          type="button"
                          className={`mb-jw-tool${tools.includes(tool) ? " is-active" : ""}`}
                          aria-pressed={tools.includes(tool)}
                          onClick={() => toggleTool(tool)}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-jw-label" htmlFor="jw-brands">
                      {t("jw_brands")}
                    </label>
                    <input
                      id="jw-brands"
                      type="text"
                      maxLength={300}
                      placeholder={t("jw_brandsPh")}
                      value={fields.brandsCarried}
                      onChange={setField("brandsCarried")}
                      className="mb-jw-input"
                    />
                  </div>
                )}
                <label className="mb-jw-check">
                  <input
                    type="checkbox"
                    checked={net30}
                    onChange={(event) => setNet30(event.target.checked)}
                  />
                  <span>{t("jw_net30")}</span>
                </label>
                <div>
                  <label className="mb-jw-label" htmlFor="jw-message">
                    {t("jw_message")}
                  </label>
                  <textarea
                    id="jw-message"
                    rows={3}
                    maxLength={2000}
                    value={fields.message}
                    onChange={setField("message")}
                    className="mb-jw-input mb-jw-textarea"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {submitFailed && (
          <div className="mb-jw-submit-err" role="alert">
            {t("jw_submitErr")}
          </div>
        )}

        {step > 0 && (
          <div className="mb-jw-nav">
            <button
              type="button"
              className="mb-jw-backbtn"
              onClick={() => goTo(step - 1, -1)}
              disabled={submitting}
            >
              {t("jw_back")}
            </button>
            {step !== 1 && (
              <button type="submit" className="mb-jw-nextbtn" disabled={submitting}>
                {submitting
                  ? t("jw_submitting")
                  : step === LAST_STEP
                    ? t("jw_submit")
                    : t("jw_next")}
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

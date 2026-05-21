"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import {
  sanitizeEmailInput,
  sanitizeMessageText,
  sanitizePhoneDigits,
  sanitizeSingleLineText,
  validateInquiryForm,
} from "@/lib/inquiryFormValidation";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
  visitDate: "",
  meetingDateTime: "",
};

const PHONE_DIGITS = 10;

const TAB_MEETING = "book_meeting";
const TAB_VISIT = "site_visit";

const AREA_OF_INTEREST_OPTIONS = [
  "Affordable Residential",
  "Luxury Residential",
  "Lockable Retail Shops",
  "Pre Leased Investments",
  "Plots",
];

const MODAL_VALIDATE_OPTS = {
  requirePhone: true,
  phoneMinDigits: PHONE_DIGITS,
  phoneMaxDigits: PHONE_DIGITS,
  minMessage: 10,
  requireInterest: true,
  minInterest: 3,
};

function todayDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function nowDateTimeLocalString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function SuccessCheckIcon({ gradId }) {
  const gid = `inquiry-check-${gradId}`.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 12.5 L11 16.5 L17.5 8"
        stroke={`url(#${gid})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={gid} x1="6" y1="12.5" x2="18.5" y2="12.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#047857" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function InquiryModal() {
  const successIconGradId = useId();
  const modalRef = useRef(null);
  const autoCloseTimerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(TAB_MEETING);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const minVisitDate = todayDateString();
  const minMeetingDateTime = nowDateTimeLocalString();
  const isSiteVisitTab = activeTab === TAB_VISIT;
  const isBookMeetingTab = activeTab === TAB_MEETING;

  /**
   * Listen on the real modal node (ref) so events survive Strict Mode / remounts.
   * Clear errors on shown so reopen never shows stale blur/submit validation.
   */
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return undefined;

    const clearErrors = () => {
      setFieldErrors({});
      setError("");
      setSubmitting(false);
    };

    const onShown = () => {
      clearErrors();
    };

    const onHidden = () => {
      if (autoCloseTimerRef.current != null) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      setSuccess(false);
      setActiveTab(TAB_MEETING);
      clearErrors();
    };

    el.addEventListener("shown.bs.modal", onShown);
    el.addEventListener("hidden.bs.modal", onHidden);
    return () => {
      el.removeEventListener("shown.bs.modal", onShown);
      el.removeEventListener("hidden.bs.modal", onHidden);
      if (autoCloseTimerRef.current != null) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, []);

  const updateField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setError("");
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const formSnapshot = () => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    interest: form.interest,
    message: form.message,
  });

  const validateVisitDate = (value) => {
    if (!isSiteVisitTab) return "";
    const raw = String(value || "").trim();
    if (!raw) return "Please pick a preferred visit date.";
    const picked = new Date(raw);
    if (Number.isNaN(picked.getTime())) return "Please pick a valid date.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    picked.setHours(0, 0, 0, 0);
    if (picked.getTime() < today.getTime()) {
      return "Visit date can't be in the past.";
    }
    return "";
  };

  const validateMeetingDateTime = (value) => {
    if (!isBookMeetingTab) return "";
    const raw = String(value || "").trim();
    if (!raw) return "Please pick a preferred meeting date and time.";
    const picked = new Date(raw);
    if (Number.isNaN(picked.getTime())) return "Please pick a valid date and time.";
    if (picked.getTime() < Date.now()) {
      return "Meeting time can't be in the past.";
    }
    return "";
  };

  /** Re-validate a single field after blur so errors show without waiting for submit. */
  const validateFieldOnBlur = (fieldKey) => {
    if (fieldKey === "visitDate") {
      const msg = validateVisitDate(form.visitDate);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (msg) next.visitDate = msg;
        else delete next.visitDate;
        return next;
      });
      return;
    }
    if (fieldKey === "meetingDateTime") {
      const msg = validateMeetingDateTime(form.meetingDateTime);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (msg) next.meetingDateTime = msg;
        else delete next.meetingDateTime;
        return next;
      });
      return;
    }
    const { errors } = validateInquiryForm(formSnapshot(), MODAL_VALIDATE_OPTS);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (errors[fieldKey]) next[fieldKey] = errors[fieldKey];
      else delete next[fieldKey];
      return next;
    });
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setError("");
    setFieldErrors((prev) => {
      if (!prev.visitDate && !prev.meetingDateTime) return prev;
      const n = { ...prev };
      delete n.visitDate;
      delete n.meetingDateTime;
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, errors } = validateInquiryForm(formSnapshot(), MODAL_VALIDATE_OPTS);
    const visitDateError = validateVisitDate(form.visitDate);
    const meetingDateTimeError = validateMeetingDateTime(form.meetingDateTime);
    if (visitDateError) errors.visitDate = visitDateError;
    if (meetingDateTimeError) errors.meetingDateTime = meetingDateTimeError;
    if (!ok || visitDateError || meetingDateTimeError) {
      setFieldErrors(errors);
      setError("");
      return;
    }
    setFieldErrors({});
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          interest: form.interest.trim(),
          message: form.message.trim(),
          inquiryType: activeTab,
          visitDate: isSiteVisitTab ? form.visitDate : "",
          meetingDateTime: isBookMeetingTab ? form.meetingDateTime : "",
          pageName: isSiteVisitTab
            ? "header-book-site-visit"
            : "header-book-meeting",
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setForm(INITIAL_FORM);
        setFieldErrors({});
        if (autoCloseTimerRef.current != null) {
          clearTimeout(autoCloseTimerRef.current);
        }
        autoCloseTimerRef.current = setTimeout(() => {
          autoCloseTimerRef.current = null;
          const modalEl = modalRef.current;
          if (!modalEl) return;
          const bsModal = window.bootstrap?.Modal?.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }, 4800);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="modal fade"
      id="modalInquiry"
      tabIndex={-1}
      aria-labelledby="inquiryModalLabel"
      aria-hidden="true"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        style={{ maxWidth: success ? 580 : 600 }}
      >
        <div
          className={`modal-content${success ? "" : " inquiry-modal-sheet"}`}
          style={{ borderRadius: 22, overflow: "hidden", border: "none" }}
        >
          <div
            style={{
              padding: success ? "1.25rem 1.75rem 2rem" : "2rem 2.35rem 2.15rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {success ? (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.35rem" }}>
                  <button type="button" className="inquiry-modal-close inquiry-modal-close--ghost" data-bs-dismiss="modal" aria-label="Close">
                    ×
                  </button>
                </div>
                <div className="inquiry-modal-success" role="status" aria-live="polite" aria-atomic="true">
                <div className="inquiry-modal-success__glow" aria-hidden />
                <div className="inquiry-modal-success__glow-mint" aria-hidden />
                <span className="inquiry-success-sparkle inquiry-success-sparkle--1" aria-hidden />
                <span className="inquiry-success-sparkle inquiry-success-sparkle--2" aria-hidden />
                <span className="inquiry-success-sparkle inquiry-success-sparkle--3" aria-hidden />
                <span className="inquiry-success-sparkle inquiry-success-sparkle--4" aria-hidden />
                <div className="inquiry-modal-success__content">
                  <div className="inquiry-success-icon-wrap">
                    <div className="inquiry-success-icon-ring" aria-hidden />
                    <div className="inquiry-success-icon-ring inquiry-success-icon-ring--delay" aria-hidden />
                    <div className="inquiry-success-icon-circle">
                      <SuccessCheckIcon gradId={successIconGradId} />
                    </div>
                  </div>
                  <h2 id="inquiryModalLabel" className="inquiry-success-title">
                    {isSiteVisitTab
                      ? "Site visit request received!"
                      : "Meeting request received!"}
                  </h2>
                  <p className="inquiry-success-sub">
                    {isSiteVisitTab
                      ? "We've noted your preferred visit date. Our team will confirm the slot within "
                      : "We've noted your preferred meeting time. Our team will confirm the slot within "}
                    <strong style={{ color: "#374151", fontWeight: 700 }}>24 hours</strong> with next steps.
                  </p>
                  <div className="inquiry-success-badges">
                    <span className="inquiry-success-badge">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M12 8v4l2.5 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Fast response
                    </span>
                    <span className="inquiry-success-badge">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Dedicated expert
                    </span>
                  </div>
                  <p className="inquiry-success-hint">This window will close automatically in a moment.</p>
                </div>
              </div>
              </>
            ) : (
              <div className="inquiry-modal-form-layout">
                <div className="inquiry-modal-form-layout__glow" aria-hidden />
                <div className="inquiry-modal-form-layout__glow-bottom" aria-hidden />
                <div className="inquiry-modal-form-layout__inner">
                  <header className="inquiry-modal-form-head inquiry-modal-form-head--center">
                    <button
                      type="button"
                      className="inquiry-modal-close inquiry-modal-close--corner"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="inquiry-modal-form-head-text">
                      <p className="inquiry-modal-form-eyebrow">We&apos;re here to help</p>
                      <h2 id="inquiryModalLabel" className="inquiry-modal-form-title">
                        {isSiteVisitTab ? "Book a Site Visit" : "Book a Meeting"}
                      </h2>
                      <p className="inquiry-modal-form-sub">
                        {isSiteVisitTab
                          ? "Pick a preferred date and we'll arrange your site visit."
                          : "Pick a date and time and our team will confirm your meeting."}
                      </p>
                    </div>
                  </header>
                  <div className="inquiry-modal-tabs" role="tablist" aria-label="Inquiry type">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isBookMeetingTab}
                      className={`inquiry-modal-tab${isBookMeetingTab ? " inquiry-modal-tab--active" : ""}`}
                      onClick={() => handleTabChange(TAB_MEETING)}
                    >
                      Book a Meeting
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isSiteVisitTab}
                      className={`inquiry-modal-tab${isSiteVisitTab ? " inquiry-modal-tab--active" : ""}`}
                      onClick={() => handleTabChange(TAB_VISIT)}
                    >
                      Book a Site Visit
                    </button>
                  </div>
                  <form className="inquiry-modal-form" onSubmit={handleSubmit} noValidate>
                    {error ? <div className="inquiry-modal-error-banner">{error}</div> : null}

                    <div className="inquiry-modal-grid-2">
                      <div>
                        <label className="inquiry-modal-field-label" htmlFor="inquiry-name">
                          Full name *
                        </label>
                        <input
                          id="inquiry-name"
                          type="text"
                          className={`inquiry-modal-input${fieldErrors.name ? " inquiry-modal-input--invalid" : ""}`}
                          value={form.name}
                          onChange={(e) => updateField("name", sanitizeSingleLineText(e.target.value))}
                          onBlur={() => validateFieldOnBlur("name")}
                          placeholder="Your name"
                          aria-invalid={!!fieldErrors.name}
                          aria-describedby={fieldErrors.name ? "inquiry-name-error" : undefined}
                          autoComplete="name"
                        />
                        {fieldErrors.name ? (
                          <span id="inquiry-name-error" className="form-field-error inquiry-modal-field-error" role="alert">
                            {fieldErrors.name}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <label className="inquiry-modal-field-label" htmlFor="inquiry-phone">
                          Phone *
                        </label>
                        <input
                          id="inquiry-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={PHONE_DIGITS}
                          className={`inquiry-modal-input${fieldErrors.phone ? " inquiry-modal-input--invalid" : ""}`}
                          value={form.phone}
                          onChange={(e) => updateField("phone", sanitizePhoneDigits(e.target.value, PHONE_DIGITS))}
                          onBlur={() => validateFieldOnBlur("phone")}
                          placeholder="10-digit mobile number"
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? "inquiry-phone-error" : undefined}
                          autoComplete="tel"
                        />
                        {fieldErrors.phone ? (
                          <span id="inquiry-phone-error" className="form-field-error inquiry-modal-field-error" role="alert">
                            {fieldErrors.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="inquiry-modal-grid-2">
                      <div>
                        <label className="inquiry-modal-field-label" htmlFor="inquiry-email">
                          Email *
                        </label>
                        <input
                          id="inquiry-email"
                          type="email"
                          className={`inquiry-modal-input${fieldErrors.email ? " inquiry-modal-input--invalid" : ""}`}
                          value={form.email}
                          onChange={(e) => updateField("email", sanitizeEmailInput(e.target.value))}
                          onBlur={() => validateFieldOnBlur("email")}
                          placeholder="your@email.com"
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={fieldErrors.email ? "inquiry-email-error" : undefined}
                          autoComplete="email"
                        />
                        {fieldErrors.email ? (
                          <span id="inquiry-email-error" className="form-field-error inquiry-modal-field-error" role="alert">
                            {fieldErrors.email}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <label className="inquiry-modal-field-label" htmlFor="inquiry-interest">
                          Area of interest *
                        </label>
                        <select
                          id="inquiry-interest"
                          className={`inquiry-modal-input inquiry-modal-input--select${fieldErrors.interest ? " inquiry-modal-input--invalid" : ""}${!form.interest ? " inquiry-modal-input--placeholder" : ""}`}
                          value={form.interest}
                          onChange={(e) => updateField("interest", e.target.value)}
                          onBlur={() => validateFieldOnBlur("interest")}
                          aria-invalid={!!fieldErrors.interest}
                          aria-describedby={fieldErrors.interest ? "inquiry-interest-error" : undefined}
                        >
                          <option value="" disabled hidden>
                            Select an option
                          </option>
                          {AREA_OF_INTEREST_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.interest ? (
                          <span id="inquiry-interest-error" className="form-field-error inquiry-modal-field-error" role="alert">
                            {fieldErrors.interest}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {isSiteVisitTab ? (
                      <div>
                        <label className="inquiry-modal-field-label" htmlFor="inquiry-visit-date">
                          Preferred visit date *
                        </label>
                        <input
                          id="inquiry-visit-date"
                          type="date"
                          min={minVisitDate}
                          className={`inquiry-modal-input${fieldErrors.visitDate ? " inquiry-modal-input--invalid" : ""}`}
                          value={form.visitDate}
                          onChange={(e) => updateField("visitDate", e.target.value)}
                          onBlur={() => validateFieldOnBlur("visitDate")}
                          aria-invalid={!!fieldErrors.visitDate}
                          aria-describedby={fieldErrors.visitDate ? "inquiry-visit-date-error" : undefined}
                        />
                        {fieldErrors.visitDate ? (
                          <span
                            id="inquiry-visit-date-error"
                            className="form-field-error inquiry-modal-field-error"
                            role="alert"
                          >
                            {fieldErrors.visitDate}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {isBookMeetingTab ? (
                      <div>
                        <label className="inquiry-modal-field-label" htmlFor="inquiry-meeting-datetime">
                          Preferred meeting date &amp; time *
                        </label>
                        <input
                          id="inquiry-meeting-datetime"
                          type="datetime-local"
                          min={minMeetingDateTime}
                          className={`inquiry-modal-input${fieldErrors.meetingDateTime ? " inquiry-modal-input--invalid" : ""}`}
                          value={form.meetingDateTime}
                          onChange={(e) => updateField("meetingDateTime", e.target.value)}
                          onBlur={() => validateFieldOnBlur("meetingDateTime")}
                          aria-invalid={!!fieldErrors.meetingDateTime}
                          aria-describedby={
                            fieldErrors.meetingDateTime
                              ? "inquiry-meeting-datetime-error"
                              : undefined
                          }
                        />
                        {fieldErrors.meetingDateTime ? (
                          <span
                            id="inquiry-meeting-datetime-error"
                            className="form-field-error inquiry-modal-field-error"
                            role="alert"
                          >
                            {fieldErrors.meetingDateTime}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div>
                      <label className="inquiry-modal-field-label" htmlFor="inquiry-message">
                        Your message *
                      </label>
                      <input
                        id="inquiry-message"
                        type="text"
                        className={`inquiry-modal-input${fieldErrors.message ? " inquiry-modal-input--invalid" : ""}`}
                        value={form.message}
                        onChange={(e) => updateField("message", sanitizeMessageText(e.target.value))}
                        onBlur={() => validateFieldOnBlur("message")}
                        placeholder="Tell us briefly what you're looking for..."
                        aria-invalid={!!fieldErrors.message}
                        aria-describedby={fieldErrors.message ? "inquiry-message-error" : undefined}
                      />
                      {fieldErrors.message ? (
                        <span id="inquiry-message-error" className="form-field-error inquiry-modal-field-error" role="alert">
                          {fieldErrors.message}
                        </span>
                      ) : null}
                    </div>

                    <button type="submit" className="inquiry-modal-submit" disabled={submitting}>
                      {submitting
                        ? "Sending…"
                        : isSiteVisitTab
                        ? "Request site visit"
                        : "Schedule meeting"}
                    </button>

                    <p className="inquiry-modal-footnote">
                      By submitting, you agree to our privacy policy. We&apos;ll never spam you.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiTag, FiHeadphones, FiPercent, FiAward } from "react-icons/fi";
import api from "@/lib/axios";
import {
  firstErrorMessage,
  sanitizeEmailInput,
  sanitizeMessageText,
  sanitizePhoneDigits,
  sanitizeSingleLineText,
  validateInquiryForm,
} from "@/lib/inquiryFormValidation";
import ContactOfficeDetails from "./ContactOfficeDetails";

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

const VALIDATE_OPTS = {
  requirePhone: true,
  phoneMinDigits: PHONE_DIGITS,
  phoneMaxDigits: PHONE_DIGITS,
  minMessage: 10,
  requireInterest: true,
  minInterest: 3,
};

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
  visitDate: "",
  meetingDateTime: "",
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

function clearKey(setter, key) {
  setter((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}

const DEFAULT_BADGES = [
  { title: "Lowest Price", subtitle: "Guaranteed" },
  { title: "Full Service", subtitle: "Support" },
  { title: "Zero", subtitle: "Brokerage" },
];

/**
 * Always render a theme-colored react-icon, chosen from the badge text.
 * Any emoji/string icon coming from the CMS is intentionally ignored so the
 * icons stay on-brand and consistent.
 */
function resolveBadgeIcon(badge) {
  const text = `${badge?.title || ""} ${badge?.subtitle || ""}`.toLowerCase();
  if (/price|cost|deal|offer/.test(text)) return <FiTag size={26} aria-hidden />;
  if (/service|support|help|assist|care/.test(text)) return <FiHeadphones size={26} aria-hidden />;
  if (/zero|brokerage|commission|fee|charge/.test(text)) return <FiPercent size={26} aria-hidden />;
  return <FiAward size={26} aria-hidden />;
}

export default function ContactMainSection({ contactInfo = {} }) {
  const trustBadges = (contactInfo.trustBadges || []).filter((b) => b.title);
  const rawStats    = (contactInfo.heroStats  || []).filter((s) => s.value && s.label);
  const heroStats   = rawStats.length > 0 ? rawStats : [
    { value: "500+", label: "Projects Delivered" },
    { value: "10K+", label: "Happy Clients" },
    { value: "24h",  label: "Response Time" },
  ];

  const [form, setForm]               = useState(INITIAL_FORM);
  const [activeTab, setActiveTab]     = useState(TAB_MEETING);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isSiteVisitTab   = activeTab === TAB_VISIT;
  const isBookMeetingTab = activeTab === TAB_MEETING;
  const minVisitDate        = todayDateString();
  const minMeetingDateTime  = nowDateTimeLocalString();

  const formTitle = isSiteVisitTab
    ? "Book a Site Visit"
    : "Connect with an Expert";
  const formSubtitle = isSiteVisitTab
    ? "Pick a preferred date and we'll arrange your site visit."
    : "Share your details — our team will respond within one business day.";

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearKey(setFieldErrors, key);
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
    if (picked.getTime() < today.getTime()) return "Visit date can't be in the past.";
    return "";
  };

  const validateMeetingDateTime = (value) => {
    if (!isBookMeetingTab) return "";
    const raw = String(value || "").trim();
    if (!raw) return "Please pick a preferred meeting date and time.";
    const picked = new Date(raw);
    if (Number.isNaN(picked.getTime())) return "Please pick a valid date and time.";
    if (picked.getTime() < Date.now()) return "Meeting time can't be in the past.";
    return "";
  };

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
    const { errors } = validateInquiryForm(formSnapshot(), VALIDATE_OPTS);
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
    const { ok, errors } = validateInquiryForm(formSnapshot(), VALIDATE_OPTS);
    const visitDateError       = validateVisitDate(form.visitDate);
    const meetingDateTimeError = validateMeetingDateTime(form.meetingDateTime);
    if (visitDateError) errors.visitDate = visitDateError;
    if (meetingDateTimeError) errors.meetingDateTime = meetingDateTimeError;

    if (!ok || visitDateError || meetingDateTimeError) {
      setFieldErrors(errors);
      const msg = firstErrorMessage(errors)
        || visitDateError
        || meetingDateTimeError;
      if (msg) toast.error(msg);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        name:     form.name.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim(),
        interest: form.interest.trim(),
        message:  form.message.trim(),
        inquiryType:     activeTab,
        visitDate:       isSiteVisitTab   ? form.visitDate       : "",
        meetingDateTime: isBookMeetingTab ? form.meetingDateTime : "",
        pageName: isSiteVisitTab ? "contact-book-site-visit" : "contact-book-meeting",
      });
      toast.success(isSiteVisitTab
        ? "Site visit request received! Our team will confirm shortly."
        : "Meeting request received! Our team will confirm shortly.");
      setSubmitted(true);
    } catch {
      // axios interceptor shows toast
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setActiveTab(TAB_MEETING);
  };

  const displayBadges = trustBadges.length > 0 ? trustBadges : DEFAULT_BADGES;

  return (
    <>
      {/* ── Hero banner ───────────────────────────────────── */}
      <div className="ci-hero">
        <div className="ci-hero__overlay" aria-hidden="true" />
        <div className="tf-container ci-hero__inner">
          <div className="ci-hero__text">
            <h1 className="ci-hero__title">
              {contactInfo.bannerTitle || "Contact Us"}
            </h1>
            {contactInfo.bannerSubtitle && (
              <p className="ci-hero__subtitle">{contactInfo.bannerSubtitle}</p>
            )}
          </div>
          <div className="ci-hero__stats">
            {heroStats.map((stat, i) => (
              <>
                {i > 0 && <div key={`d-${i}`} className="ci-hero__stat-divider" />}
                <div key={i} className="ci-hero__stat">
                  <span className="ci-hero__stat-num">{stat.value}</span>
                  <span className="ci-hero__stat-lbl">{stat.label}</span>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main two-column section ───────────────────────── */}
      <section className="ci-main-section">
        <div className="tf-container">
          <div className="ci-main-grid">

            <div className="ci-left-panel">
              <ContactOfficeDetails contactInfo={contactInfo} />

              <div className="ci-trust-grid" aria-label="Our promises">
                {displayBadges.map((b, i) => (
                  <div key={i} className="ci-trust-card">
                    <div className="ci-trust-card__icon">{resolveBadgeIcon(b)}</div>
                    <div className="ci-trust-card__text">
                      <strong>{b.title}</strong>
                      {b.subtitle && <span>{b.subtitle}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ci-right-panel">
              <div className="ci-form-card">
                {submitted ? (
                  <div className="ci-form-success">
                    <div className="ci-form-success__icon">
                      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="2.5"/>
                        <path d="M14 27l8 8 16-16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Thank you!</h3>
                    <p>
                      {isSiteVisitTab
                        ? "We've noted your preferred visit date. Our team will confirm within 24 hours."
                        : "We've noted your preferred meeting time. Our team will confirm within 24 hours."}
                    </p>
                    <button className="ci-form-btn" onClick={resetForm}>
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="ci-form-card__header">
                      <h2 className="ci-form-card__title">{formTitle}</h2>
                      <p className="ci-form-card__subtitle">{formSubtitle}</p>
                    </div>

                    <div className="ci-tabs" role="tablist" aria-label="Inquiry type">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isBookMeetingTab}
                        className={`ci-tab${isBookMeetingTab ? " ci-tab--active" : ""}`}
                        onClick={() => handleTabChange(TAB_MEETING)}
                      >
                        Connect with an Expert
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isSiteVisitTab}
                        className={`ci-tab${isSiteVisitTab ? " ci-tab--active" : ""}`}
                        onClick={() => handleTabChange(TAB_VISIT)}
                      >
                        Book a Site Visit
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="ci-form-body">
                      <div className="ci-form-row">
                        <div className="ci-field">
                          <label htmlFor="ci-name">Full Name *</label>
                          <input
                            id="ci-name"
                            type="text"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) => updateField("name", sanitizeSingleLineText(e.target.value))}
                            onBlur={() => validateFieldOnBlur("name")}
                            aria-invalid={!!fieldErrors.name}
                            className={fieldErrors.name ? "ci-input ci-input--err" : "ci-input"}
                            autoComplete="name"
                          />
                          {fieldErrors.name && <span className="ci-field-err">{fieldErrors.name}</span>}
                        </div>

                        <div className="ci-field">
                          <label htmlFor="ci-phone">Phone Number *</label>
                          <input
                            id="ci-phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={PHONE_DIGITS}
                            placeholder="10-digit mobile number"
                            value={form.phone}
                            onChange={(e) => updateField("phone", sanitizePhoneDigits(e.target.value, PHONE_DIGITS))}
                            onBlur={() => validateFieldOnBlur("phone")}
                            aria-invalid={!!fieldErrors.phone}
                            className={fieldErrors.phone ? "ci-input ci-input--err" : "ci-input"}
                            autoComplete="tel"
                          />
                          {fieldErrors.phone && <span className="ci-field-err">{fieldErrors.phone}</span>}
                        </div>
                      </div>

                      <div className="ci-form-row">
                        <div className="ci-field">
                          <label htmlFor="ci-email">Email Address *</label>
                          <input
                            id="ci-email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => updateField("email", sanitizeEmailInput(e.target.value))}
                            onBlur={() => validateFieldOnBlur("email")}
                            aria-invalid={!!fieldErrors.email}
                            className={fieldErrors.email ? "ci-input ci-input--err" : "ci-input"}
                            autoComplete="email"
                          />
                          {fieldErrors.email && <span className="ci-field-err">{fieldErrors.email}</span>}
                        </div>

                        <div className="ci-field">
                          <label htmlFor="ci-interest">Area of Interest *</label>
                          <select
                            id="ci-interest"
                            value={form.interest}
                            onChange={(e) => updateField("interest", e.target.value)}
                            onBlur={() => validateFieldOnBlur("interest")}
                            aria-invalid={!!fieldErrors.interest}
                            className={`ci-input ci-input--select${fieldErrors.interest ? " ci-input--err" : ""}${!form.interest ? " ci-input--placeholder" : ""}`}
                          >
                            <option value="" disabled hidden>Select an option</option>
                            {AREA_OF_INTEREST_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {fieldErrors.interest && <span className="ci-field-err">{fieldErrors.interest}</span>}
                        </div>
                      </div>

                      {isSiteVisitTab ? (
                        <div className="ci-field">
                          <label htmlFor="ci-visit-date">Preferred visit date *</label>
                          <input
                            id="ci-visit-date"
                            type="date"
                            min={minVisitDate}
                            value={form.visitDate}
                            onChange={(e) => updateField("visitDate", e.target.value)}
                            onBlur={() => validateFieldOnBlur("visitDate")}
                            aria-invalid={!!fieldErrors.visitDate}
                            className={fieldErrors.visitDate ? "ci-input ci-input--err" : "ci-input"}
                          />
                          {fieldErrors.visitDate && <span className="ci-field-err">{fieldErrors.visitDate}</span>}
                        </div>
                      ) : null}

                      {isBookMeetingTab ? (
                        <div className="ci-field">
                          <label htmlFor="ci-meeting-datetime">Preferred meeting date &amp; time *</label>
                          <input
                            id="ci-meeting-datetime"
                            type="datetime-local"
                            min={minMeetingDateTime}
                            value={form.meetingDateTime}
                            onChange={(e) => updateField("meetingDateTime", e.target.value)}
                            onBlur={() => validateFieldOnBlur("meetingDateTime")}
                            aria-invalid={!!fieldErrors.meetingDateTime}
                            className={fieldErrors.meetingDateTime ? "ci-input ci-input--err" : "ci-input"}
                          />
                          {fieldErrors.meetingDateTime && <span className="ci-field-err">{fieldErrors.meetingDateTime}</span>}
                        </div>
                      ) : null}

                      <div className="ci-field">
                        <label htmlFor="ci-message">Message *</label>
                        <input
                          id="ci-message"
                          type="text"
                          placeholder="Tell us briefly what you're looking for…"
                          value={form.message}
                          onChange={(e) => updateField("message", sanitizeMessageText(e.target.value))}
                          onBlur={() => validateFieldOnBlur("message")}
                          aria-invalid={!!fieldErrors.message}
                          className={`ci-input${fieldErrors.message ? " ci-input--err" : ""}`}
                        />
                        {fieldErrors.message && <span className="ci-field-err">{fieldErrors.message}</span>}
                      </div>

                      <p className="ci-form-consent">
                        By submitting, I authorise Global Realty and its representatives to contact me via Call, SMS, WhatsApp, or Email. This consent overrides any NDNC/DND registration.
                      </p>

                      <button type="submit" className="ci-form-btn" disabled={submitting}>
                        {submitting ? <span className="ci-form-btn__spinner" /> : null}
                        {submitting
                          ? "Sending…"
                          : isSiteVisitTab
                            ? "Request site visit"
                            : "Schedule meeting"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Map ──────────────────────────────────────────── */}
      {contactInfo.mapEmbedUrl && (
        <section className="ci-map-section" aria-label="Our location on map">
          <div className="ci-map-section__inner tf-container">
            <div className="ci-map-section__header">
              <h2>Find Us</h2>
              <p>Visit our office — we&apos;re happy to meet in person.</p>
            </div>
            <div className="ci-map-wrap">
              <iframe
                src={contactInfo.mapEmbedUrl}
                width="100%"
                height="420"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location"
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}

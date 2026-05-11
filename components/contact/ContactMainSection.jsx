"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import {
  firstErrorMessage,
  validateInquiryForm,
} from "@/lib/inquiryFormValidation";
import ContactOfficeDetails from "./ContactOfficeDetails";

function clearKey(setter, key) {
  setter((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}

const DEFAULT_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <path d="M24 4L28.5 14.5L40 16L31.5 24L33.5 35.5L24 30.5L14.5 35.5L16.5 24L8 16L19.5 14.5L24 4Z" fill="currentColor" opacity="0.9"/>
        <path d="M20 40L24 38L28 40V46L24 44L20 46V40Z" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
    title: "Lowest Price",
    subtitle: "Guaranteed",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M14 24h-6M40 24h-6M24 14v-6M24 40v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 30a8 8 0 0 1 0-12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 18a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Full Service",
    subtitle: "Support",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M24 12v24M18 18h9a3 3 0 0 1 0 6H18a3 3 0 0 0 0 6h9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="12" y1="12" x2="36" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
    title: "Zero",
    subtitle: "Brokerage",
  },
];

export default function ContactMainSection({ contactInfo = {} }) {
  const formTitle   = contactInfo.formTitle   || "Contact our Real Estate Experts";
  const formSubtitle= contactInfo.formSubtitle|| "Fill in the form and we'll reach out within 24 hours.";
  const trustBadges = (contactInfo.trustBadges || []).filter((b) => b.title);
  const rawStats    = (contactInfo.heroStats  || []).filter((s) => s.value && s.label);
  const heroStats   = rawStats.length > 0 ? rawStats : [
    { value: "500+",  label: "Projects Delivered" },
    { value: "10K+",  label: "Happy Clients" },
    { value: "24h",   label: "Response Time" },
  ];

  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [message,    setMessage]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [fieldErrors,setFieldErrors]= useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, errors } = validateInquiryForm({ name, email, phone, message }, { minMessage: 0 });
    if (!ok) {
      setFieldErrors(errors);
      const msg = firstErrorMessage(errors);
      if (msg) toast.error(msg);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        name:     name.trim(),
        email:    email.trim(),
        phone:    phone.trim(),
        message:  message.trim(),
        pageName: "contact",
      });
      toast.success("Message sent! We'll get back to you soon.");
      setSubmitted(true);
    } catch {
      // axios interceptor shows toast
    } finally {
      setSubmitting(false);
    }
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

            {/* Left: office details */}
            <div className="ci-left-panel">
              <ContactOfficeDetails contactInfo={contactInfo} />
            </div>

            {/* Right: form card */}
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
                    <p>Your message has been received and stored. Our experts will contact you shortly.</p>
                    <button
                      className="ci-form-btn"
                      onClick={() => { setSubmitted(false); setName(""); setEmail(""); setPhone(""); setMessage(""); }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="ci-form-card__header">
                      <h2 className="ci-form-card__title">{formTitle}</h2>
                      <p className="ci-form-card__subtitle">{formSubtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="ci-form-body">
                      <div className="ci-form-row">
                        <div className="ci-field">
                          <label htmlFor="ci-name">Full Name *</label>
                          <input
                            id="ci-name"
                            type="text"
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearKey(setFieldErrors, "name"); }}
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
                            placeholder="+91 XXXXX XXXXX"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); clearKey(setFieldErrors, "phone"); }}
                            aria-invalid={!!fieldErrors.phone}
                            className={fieldErrors.phone ? "ci-input ci-input--err" : "ci-input"}
                            autoComplete="tel"
                          />
                          {fieldErrors.phone && <span className="ci-field-err">{fieldErrors.phone}</span>}
                        </div>
                      </div>

                      <div className="ci-field">
                        <label htmlFor="ci-email">Email Address *</label>
                        <input
                          id="ci-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); clearKey(setFieldErrors, "email"); }}
                          aria-invalid={!!fieldErrors.email}
                          className={fieldErrors.email ? "ci-input ci-input--err" : "ci-input"}
                          autoComplete="email"
                        />
                        {fieldErrors.email && <span className="ci-field-err">{fieldErrors.email}</span>}
                      </div>

                      <div className="ci-field">
                        <label htmlFor="ci-message">Message</label>
                        <textarea
                          id="ci-message"
                          rows={4}
                          placeholder="How can we help you?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="ci-input ci-input--ta"
                        />
                      </div>

                      <p className="ci-form-consent">
                        By submitting, I authorise Global Realty and its representatives to contact me via Call, SMS, WhatsApp, or Email. This consent overrides any NDNC/DND registration.
                      </p>

                      <button type="submit" className="ci-form-btn" disabled={submitting}>
                        {submitting ? (
                          <span className="ci-form-btn__spinner" />
                        ) : null}
                        {submitting ? "Sending…" : "Send Message"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────── */}
      <section className="ci-trust-section" aria-label="Our promises">
        <div className="tf-container">
          <div className="ci-trust-grid">
            {displayBadges.map((b, i) => (
              <div key={i} className="ci-trust-card">
                <div className="ci-trust-card__icon">
                  {typeof b.icon === "string" ? (
                    <span style={{ fontSize: "3.75rem" }}>{b.icon}</span>
                  ) : (
                    b.icon
                  )}
                </div>
                <div className="ci-trust-card__text">
                  <strong>{b.title}</strong>
                  {b.subtitle && <span>{b.subtitle}</span>}
                </div>
              </div>
            ))}
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

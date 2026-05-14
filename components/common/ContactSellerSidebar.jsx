"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiShare2, FiDownload, FiSearch } from "react-icons/fi";
import api from "@/lib/axios";
import {
  firstErrorMessage,
  validateInquiryForm,
} from "@/lib/inquiryFormValidation";
import { formatPropertyPriceCrLac } from "@/lib/formatPropertyPriceIN";

const emptyForm = { name: "", email: "", phone: "" };

function defaultSidebarInquiryMessage(property, inquiryMeta) {
  if (property?.title)
    return `Property inquiry: ${String(property.title).trim()}`;
  const pn = String(inquiryMeta?.projectName || "").trim();
  if (pn) return `Inquiry from ${pn}`;
  return "Website sidebar inquiry";
}

function clearErr(setter, key) {
  setter((prev) => {
    if (!prev[key]) return prev;
    const n = { ...prev };
    delete n[key];
    return n;
  });
}

function getOverviewValue(property, patterns) {
  const od = Array.isArray(property?.overviewData) ? property.overviewData : [];
  for (const item of od) {
    const k = String(item?.key || "").toLowerCase();
    if (patterns.some((re) => re.test(k)) && String(item?.value || "").trim()) {
      return String(item.value).trim();
    }
  }
  return "";
}

function getBuilderName(property) {
  if (!property) return "";
  const direct =
    property.builderName ||
    property.developerName ||
    property.developer ||
    property.promoter;
  if (direct && String(direct).trim()) return String(direct).trim();
  const fromOverview = getOverviewValue(property, [
    /builder/,
    /developer/,
    /promoter/,
    /company/,
  ]);
  if (fromOverview) return fromOverview;
  if (property.label && String(property.label).trim()) {
    return String(property.label).trim();
  }
  return "";
}

function getBrochureUrl(property) {
  const list = Array.isArray(property?.attachments) ? property.attachments : [];
  for (const a of list) {
    const u = String(a?.url || "").trim();
    if (!u) continue;
    const ft = String(a?.fileType || "").toLowerCase();
    const name = String(a?.name || "").toLowerCase();
    if (
      ft === "pdf" ||
      /\.pdf($|\?)/i.test(u) ||
      name.includes("brochure") ||
      name.includes("catalog")
    ) {
      return u;
    }
  }
  return "";
}

export default function ContactSellerSidebar({
  property,
  inquiryMeta,
  className = "",
  id = "contact-seller",
}) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!submitted) return undefined;
    const timer = setTimeout(() => {
      setSubmitted(false);
      setForm(emptyForm);
      setErrors({});
    }, 5000);
    return () => clearTimeout(timer);
  }, [submitted]);

  const getPageMeta = () => {
    const pageName =
      inquiryMeta?.pageName ??
      (typeof window !== "undefined" ? window.location.href : "");
    const projectName =
      inquiryMeta?.projectName !== undefined &&
      inquiryMeta?.projectName !== null
        ? inquiryMeta.projectName
        : (property?.title ?? "");
    return { projectName, pageName };
  };

  const submitInquiry = async (formData) => {
    const { projectName, pageName } = getPageMeta();
    const message = defaultSidebarInquiryMessage(property, inquiryMeta);
    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        name: String(formData.name || "").trim(),
        email: String(formData.email || "").trim(),
        phone: String(formData.phone || "").trim(),
        message,
        propertyId: property?._id,
        propertyTitle: property?.title,
        projectName,
        pageName,
      });
      toast.success("Message sent! We'll get back to you soon.");
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, errors: nextErrors } = validateInquiryForm(form, {
      requireMessage: false,
    });
    if (!ok) {
      setErrors(nextErrors);
      const msg = firstErrorMessage(nextErrors);
      if (msg) toast.error(msg);
      return;
    }
    setErrors({});
    await submitInquiry(form);
  };

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = property?.title || document.title;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } else {
        toast.error("Sharing is not supported in this browser");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      toast.error("Could not share. Try copying the address bar.");
    }
  }, [property?.title]);

  const brochureUrl = property ? getBrochureUrl(property) : "";

  /* ── FAQ / generic sidebar (no property) ───────────────────────────── */
  if (!property) {
    return (
      <div
        className={`tf-sidebar${className ? ` ${className}` : ""} property-inquiry-sidebar property-inquiry-sidebar--generic`}
        id={id}
      >
        <div className="property-inquiry-sticky property-inquiry-sticky--generic">
          <h4 className="property-inquiry-sticky__faq-title">
            Ask us anything
          </h4>
          <p className="property-inquiry-sticky__faq-sub">
            Share your details and our team will respond shortly.
          </p>
          <form
            className="property-inquiry-sticky__form"
            onSubmit={handleSubmit}
            noValidate
          >
            {submitted ? (
              <div className="property-inquiry-sticky__thanks">
                <p className="property-inquiry-sticky__thanks-title">
                  Thank you!
                </p>
                <p className="property-inquiry-sticky__thanks-text">
                  Your inquiry has been submitted. We&apos;ll contact you soon.
                </p>
              </div>
            ) : (
              <>
                <label
                  className="property-inquiry-sticky__label"
                  htmlFor={`${id}-g-name`}
                >
                  Your full name *
                </label>
                <input
                  id={`${id}-g-name`}
                  type="text"
                  className="property-inquiry-sticky__input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    clearErr(setErrors, "name");
                  }}
                  aria-invalid={!!errors.name}
                  autoComplete="name"
                />
                {errors.name ? (
                  <span className="form-field-error">{errors.name}</span>
                ) : null}

                <label
                  className="property-inquiry-sticky__label"
                  htmlFor={`${id}-g-phone`}
                >
                  Phone
                </label>
                <input
                  id={`${id}-g-phone`}
                  type="tel"
                  className="property-inquiry-sticky__input"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, phone: e.target.value }));
                    clearErr(setErrors, "phone");
                  }}
                  aria-invalid={!!errors.phone}
                  autoComplete="tel"
                />
                {errors.phone ? (
                  <span className="form-field-error">{errors.phone}</span>
                ) : null}

                <label
                  className="property-inquiry-sticky__label"
                  htmlFor={`${id}-g-email`}
                >
                  E-mail *
                </label>
                <input
                  id={`${id}-g-email`}
                  type="email"
                  className="property-inquiry-sticky__input"
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, email: e.target.value }));
                    clearErr(setErrors, "email");
                  }}
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
                {errors.email ? (
                  <span className="form-field-error">{errors.email}</span>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="property-inquiry-sticky__submit"
                >
                  <span>SEND MESSAGE</span>
                  <FiSearch size={18} aria-hidden />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }

  /* ── Property detail sticky inquiry ──────────────────────────────── */
  const builderName = getBuilderName(property);
  const priceLine = formatPropertyPriceCrLac(
    property.price,
    property.priceType,
    property.currency || "INR",
  );
  const specLine = String(property.specification || "").trim();
  const reraLine = String(property.reraNumber || "").trim();

  return (
    <div
      className={`tf-sidebar${className ? ` ${className}` : ""} property-inquiry-sidebar`}
      id={id}
    >
      <div className="property-inquiry-sticky">
        <div className="property-inquiry-sticky__head">
          <Link
            href="/"
            className="property-inquiry-sticky__logo-link"
            aria-label="Home"
          >
            <Image
              src="/images/logo/logo.png"
              alt=""
              width={140}
              height={44}
              className="property-inquiry-sticky__logo"
              priority={false}
            />
          </Link>
          <div className="property-inquiry-sticky__property-info">
            <p className="property-inquiry-sticky__property-line">
              <strong className="property-inquiry-sticky__property-name">
                {property.title}
              </strong>
            </p>
            {priceLine ? (
              <p className="property-inquiry-sticky__meta-row">
                <span className="property-inquiry-sticky__meta-k">Price :</span>{" "}
                <span className="property-inquiry-sticky__meta-v-muted">
                  {priceLine}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        {builderName ? (
          <p className="property-inquiry-sticky__builder">
            <span className="property-inquiry-sticky__meta-k">Builder :</span>{" "}
            <span className="property-inquiry-sticky__meta-v">
              {builderName}
            </span>
          </p>
        ) : null}

        {specLine ? (
          <p className="property-inquiry-sticky__meta-row">
            <span className="property-inquiry-sticky__meta-k">
              Configuration :
            </span>{" "}
            <span className="property-inquiry-sticky__meta-v-muted">
              {specLine}
            </span>
          </p>
        ) : null}

        {reraLine ? (
          <p className="property-inquiry-sticky__rera">
            <span className="property-inquiry-sticky__meta-k">RERA :</span>{" "}
            <span className="property-inquiry-sticky__rera-num">
              {reraLine}
            </span>
          </p>
        ) : null}

        <div className="property-inquiry-sticky__actions">
          <button
            type="button"
            className="property-inquiry-sticky__action-btn"
            onClick={handleShare}
          >
            <FiShare2 size={18} aria-hidden />
            Share
          </button>
          {brochureUrl ? (
            <a
              href={brochureUrl}
              className="property-inquiry-sticky__action-btn"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiDownload size={18} aria-hidden />
              Download Brochure
            </a>
          ) : (
            <button
              type="button"
              className="property-inquiry-sticky__action-btn property-inquiry-sticky__action-btn--disabled"
              disabled
              title="No brochure uploaded for this listing"
            >
              <FiDownload size={18} aria-hidden />
              Download Brochure
            </button>
          )}
        </div>

        <form
          className="property-inquiry-sticky__form"
          onSubmit={handleSubmit}
          noValidate
        >
          {submitted ? (
            <div className="property-inquiry-sticky__thanks">
              <p className="property-inquiry-sticky__thanks-title">
                Thank you!
              </p>
              <p className="property-inquiry-sticky__thanks-text">
                Your inquiry has been submitted. We&apos;ll contact you soon.
              </p>
            </div>
          ) : (
            <>
              <label
                className="property-inquiry-sticky__label"
                htmlFor={`${id}-name`}
              >
                Your full name *
              </label>
              <input
                id={`${id}-name`}
                type="text"
                className="property-inquiry-sticky__input"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, name: e.target.value }));
                  clearErr(setErrors, "name");
                }}
                aria-invalid={!!errors.name}
                autoComplete="name"
              />
              {errors.name ? (
                <span className="form-field-error">{errors.name}</span>
              ) : null}

              <label
                className="property-inquiry-sticky__label"
                htmlFor={`${id}-phone`}
              >
                Phone
              </label>
              <input
                id={`${id}-phone`}
                type="tel"
                className="property-inquiry-sticky__input"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => {
                  setForm((p) => ({ ...p, phone: e.target.value }));
                  clearErr(setErrors, "phone");
                }}
                aria-invalid={!!errors.phone}
                autoComplete="tel"
              />
              {errors.phone ? (
                <span className="form-field-error">{errors.phone}</span>
              ) : null}

              <label
                className="property-inquiry-sticky__label"
                htmlFor={`${id}-email`}
              >
                E-mail *
              </label>
              <input
                id={`${id}-email`}
                type="email"
                className="property-inquiry-sticky__input"
                placeholder="E-mail"
                value={form.email}
                onChange={(e) => {
                  setForm((p) => ({ ...p, email: e.target.value }));
                  clearErr(setErrors, "email");
                }}
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
              {errors.email ? (
                <span className="form-field-error">{errors.email}</span>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="property-inquiry-sticky__submit"
              >
                <span>SEND MESSAGE</span>
                <FiSearch size={18} aria-hidden />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

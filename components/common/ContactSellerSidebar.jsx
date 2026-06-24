"use client";

import api from "@/lib/axios";
import { formatPropertyPriceCrLac } from "@/lib/formatPropertyPriceIN";
import {
  firstErrorMessage,
  validateInquiryForm,
} from "@/lib/inquiryFormValidation";
import { requestGatedDownload } from "@/lib/gatedDownload";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCalendar, FiDollarSign, FiDownload, FiSend, FiShare2, FiUser } from "react-icons/fi";

const emptyForm = { name: "", email: "", phone: "" };

const SIDEBAR_FORM_CONSENT =
  "By submitting, I authorise Global Realty and its representatives to contact me via Call, SMS, WhatsApp, or Email. This consent overrides any NDNC/DND registration.";

const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;
const INDIAN_MOBILE_ERROR =
  "Enter a 10-digit mobile number starting with 6, 7, 8, or 9.";

/**
 * Accepts only digits; drops any leading characters until the first digit is
 * 6/7/8/9; caps the result to 10 digits. Keeps the UX strict so the user can
 * never type an invalid Indian mobile.
 */
function sanitizeIndianMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const firstValid = digits.search(/[6-9]/);
  if (firstValid === -1) return "";
  return digits.slice(firstValid, firstValid + 10);
}

function validateIndianMobile(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return INDIAN_MOBILE_RE.test(raw) ? "" : INDIAN_MOBILE_ERROR;
}

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

async function openInquiryModal(tab = "book_meeting") {
  if (typeof window === "undefined") return;
  const modalEl = document.getElementById("modalInquiry");
  if (!modalEl) return;
  if (modalEl.classList.contains("show")) return;

  window.dispatchEvent(
    new CustomEvent("inquiry-modal:set-tab", { detail: { tab } }),
  );

  if (window.bootstrap?.Modal) {
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    return;
  }
  try {
    const bootstrapModule = await import("bootstrap/dist/js/bootstrap.esm");
    const ModalCtor = bootstrapModule?.Modal;
    if (!ModalCtor) return;
    ModalCtor.getOrCreateInstance(modalEl).show();
  } catch {
    // bootstrap not yet hydrated; ignore
  }
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

  const handlePhoneChange = (rawValue) => {
    const next = sanitizeIndianMobile(rawValue);
    setForm((p) => ({ ...p, phone: next }));
    const msg = validateIndianMobile(next);
    setErrors((prev) => {
      const updated = { ...prev };
      if (msg) updated.phone = msg;
      else delete updated.phone;
      return updated;
    });
  };

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
    const phoneError = validateIndianMobile(form.phone);
    if (phoneError) nextErrors.phone = phoneError;
    if (!ok || phoneError) {
      setErrors(nextErrors);
      const msg = firstErrorMessage(nextErrors);
      if (msg) toast.error(msg);
      return;
    }
    setErrors({});
    await submitInquiry(form);
  };

  const handleBrochureDownload = useCallback(
    (e) => {
      e.preventDefault();
      const brochureUrl = property ? getBrochureUrl(property) : "";
      if (!brochureUrl) return;
      const { projectName, pageName } = getPageMeta();
      const fromUrl = brochureUrl.split(/[?#]/)[0].split("/").pop() || "";
      requestGatedDownload({
        url: brochureUrl,
        attachmentName: "Brochure",
        fileName:
          fromUrl ||
          `${(property?.title || "brochure").replace(/\s+/g, "-")}.pdf`,
        propertyId: property?._id ? String(property._id) : "",
        propertyTitle: property?.title || "",
        projectName: projectName || property?.title || "",
        pageName: pageName || "",
        source: "sidebar-brochure",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [property, inquiryMeta],
  );

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
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  className="property-inquiry-sticky__input"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      phone: sanitizeIndianMobile(e.target.value),
                    }));
                    clearErr(setErrors, "phone");
                  }}
                  onBlur={() => {
                    const msg = validateIndianMobile(form.phone);
                    setErrors((prev) => {
                      const next = { ...prev };
                      if (msg) next.phone = msg;
                      else delete next.phone;
                      return next;
                    });
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
                  E-mail
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

                <p className="ci-form-consent property-inquiry-sticky__consent">
                  {SIDEBAR_FORM_CONSENT}
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="property-inquiry-sticky__submit"
                >
                  <span>SEND MESSAGE</span>
                  <FiSend size={18} aria-hidden />
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
  const builderLogo = String(property.builderLogo || "").trim();
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
          {builderLogo && (
            <span className="property-inquiry-sticky__logo-link">
              <Image
                src={builderLogo}
                alt={builderName ? `${builderName} logo` : property.title}
                width={140}
                height={44}
                className="property-inquiry-sticky__logo"
                style={{
                  width: "auto",
                  height: 44,
                  maxWidth: 180,
                  objectFit: "contain",
                }}
                priority={false}
              />
            </span>
          )}
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
            onClick={() => void openInquiryModal()}
            aria-haspopup="dialog"
            aria-controls="modalInquiry"
          >
            Price on request
          </button>
          {brochureUrl && (
            <button
              type="button"
              className="property-inquiry-sticky__action-btn"
              onClick={handleBrochureDownload}
              aria-haspopup="dialog"
            >
              <FiDownload size={18} aria-hidden />
              Download Brochure
            </button>
          ) }
          <button
            type="button"
            className="property-inquiry-sticky__action-btn"
            onClick={() => void openInquiryModal()}
            aria-haspopup="dialog"
            aria-controls="modalInquiry"
          >
            Connect With An Expert
          </button>
          <button
            type="button"
            className="property-inquiry-sticky__action-btn"
            onClick={() => void openInquiryModal("site_visit")}
            aria-haspopup="dialog"
            aria-controls="modalInquiry"
          >
            Book A Site Visit
          </button>
        </div>

        {/* <form
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
                Phone *
              </label>
              <input
                id={`${id}-phone`}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                className="property-inquiry-sticky__input"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
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
                placeholder="you@example.com"
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

              <p className="ci-form-consent property-inquiry-sticky__consent">
                {SIDEBAR_FORM_CONSENT}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="property-inquiry-sticky__submit"
              >
                <span>SEND MESSAGE</span>
                <FiSend size={18} aria-hidden />
              </button>
            </>
          )}
        </form> */}
      </div>
    </div>
  );
}

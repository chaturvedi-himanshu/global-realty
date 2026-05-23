"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiX } from "react-icons/fi";
import api from "@/lib/axios";
import { GATED_DOWNLOAD_EVENT } from "@/lib/gatedDownload";

const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;
const INDIAN_MOBILE_ERROR =
  "Enter a 10-digit WhatsApp number starting with 6, 7, 8, or 9.";
const NAME_MIN_LEN = 2;

function sanitizeIndianMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const firstValid = digits.search(/[6-9]/);
  if (firstValid === -1) return "";
  return digits.slice(firstValid, firstValid + 10);
}

function sanitizeSingleLineName(value) {
  return String(value || "")
    .replace(/^[ \t]+/, "")
    .replace(/[ \t]{2,}/g, " ");
}

function validateName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Please enter your full name.";
  if (raw.length < NAME_MIN_LEN) {
    return `Please enter at least ${NAME_MIN_LEN} characters.`;
  }
  return "";
}

function validateWhatsApp(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Please enter your WhatsApp number.";
  return INDIAN_MOBILE_RE.test(raw) ? "" : INDIAN_MOBILE_ERROR;
}

function triggerBrowserDownload(url, fileName) {
  if (!url) return;
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (fileName) a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const INITIAL_META = {
  url: "",
  attachmentName: "",
  fileName: "",
  propertyId: "",
  propertyTitle: "",
  projectName: "",
  pageName: "",
  source: "",
};

export default function BrochureDownloadModal() {
  const titleId = useId();
  const nameRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState(INITIAL_META);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
    setMeta(INITIAL_META);
    setName("");
    setPhone("");
    setErrors({});
    setSubmitting(false);
    if (restoreFocusRef.current && typeof restoreFocusRef.current.focus === "function") {
      restoreFocusRef.current.focus();
    }
    restoreFocusRef.current = null;
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const detail = (e && e.detail) || {};
      if (!String(detail.url || "").trim()) return;
      restoreFocusRef.current = document.activeElement;
      setMeta({ ...INITIAL_META, ...detail });
      setName("");
      setPhone("");
      setErrors({});
      setSubmitting(false);
      setOpen(true);
    };
    window.addEventListener(GATED_DOWNLOAD_EVENT, handler);
    return () => window.removeEventListener(GATED_DOWNLOAD_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      nameRef.current?.focus();
    }, 60);
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) {
        closeModal();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, submitting, closeModal]);

  const handleNameChange = (raw) => {
    setName(sanitizeSingleLineName(raw));
    setErrors((prev) => {
      if (!prev.name) return prev;
      const next = { ...prev };
      delete next.name;
      return next;
    });
  };

  const handlePhoneChange = (raw) => {
    setPhone(sanitizeIndianMobile(raw));
    setErrors((prev) => {
      if (!prev.phone) return prev;
      const next = { ...prev };
      delete next.phone;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const nm = String(name || "").trim();
    const ph = String(phone || "").trim();
    const nameError = validateName(nm);
    const phoneError = validateWhatsApp(ph);
    if (nameError || phoneError) {
      setErrors({
        ...(nameError ? { name: nameError } : {}),
        ...(phoneError ? { phone: phoneError } : {}),
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const attachmentLabel = String(meta?.attachmentName || meta?.fileName || "Brochure").trim();
    try {
      await api.post("/inquiries", {
        name: nm,
        phone: ph,
        message: `Brochure / File download requested: ${attachmentLabel}`,
        propertyId: meta?.propertyId || undefined,
        propertyTitle: meta?.propertyTitle || "",
        projectName: meta?.projectName || meta?.propertyTitle || "",
        pageName:
          meta?.pageName ||
          (typeof window !== "undefined" ? window.location.href : ""),
        inquiryType: "brochure_download",
      });
      toast.success("Thanks! Your download is starting…");
      triggerBrowserDownload(meta?.url, meta?.fileName || attachmentLabel);
      closeModal();
    } catch {
      toast.error("Could not submit your details. Please try again.");
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const attachmentLabel = String(meta?.attachmentName || meta?.fileName || "the brochure").trim();

  return (
    <div
      className="brochure-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="brochure-modal__backdrop"
        onClick={() => !submitting && closeModal()}
        aria-hidden="true"
      />
      <div className="brochure-modal__panel" role="document">
        <button
          type="button"
          className="brochure-modal__close"
          onClick={closeModal}
          aria-label="Close"
          disabled={submitting}
        >
          <FiX size={20} aria-hidden />
        </button>

        <div className="brochure-modal__head">
          <div className="brochure-modal__icon-wrap" aria-hidden="true">
            <FiDownload size={22} />
          </div>
          <h2 id={titleId} className="brochure-modal__title">
            Get instant access
          </h2>
          <p className="brochure-modal__sub">
            Share your details to download{" "}
            <strong>{attachmentLabel}</strong>. We&apos;ll only use this to
            help with your inquiry.
          </p>
        </div>

        <form className="brochure-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="brochure-modal__field">
            <label className="brochure-modal__label" htmlFor="brochure-name">
              Full name *
            </label>
            <input
              ref={nameRef}
              id="brochure-name"
              type="text"
              autoComplete="name"
              className={`brochure-modal__input${errors.name ? " brochure-modal__input--err" : ""}`}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => {
                const msg = validateName(name);
                setErrors((prev) => {
                  const next = { ...prev };
                  if (msg) next.name = msg;
                  else delete next.name;
                  return next;
                });
              }}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              disabled={submitting}
            />
            {errors.name ? (
              <span className="brochure-modal__error" role="alert">
                {errors.name}
              </span>
            ) : null}
          </div>

          <div className="brochure-modal__field">
            <label className="brochure-modal__label" htmlFor="brochure-phone">
              WhatsApp number *
            </label>
            <input
              id="brochure-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              className={`brochure-modal__input${errors.phone ? " brochure-modal__input--err" : ""}`}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => {
                const msg = validateWhatsApp(phone);
                setErrors((prev) => {
                  const next = { ...prev };
                  if (msg) next.phone = msg;
                  else delete next.phone;
                  return next;
                });
              }}
              placeholder="10-digit WhatsApp number"
              aria-invalid={!!errors.phone}
              disabled={submitting}
            />
            {errors.phone ? (
              <span className="brochure-modal__error" role="alert">
                {errors.phone}
              </span>
            ) : null}
          </div>

          <p className="brochure-modal__consent">
            By submitting, I authorise Global Realty and its representatives to
            contact me via Call, SMS, WhatsApp, or Email. This consent overrides
            any NDNC/DND registration.
          </p>

          <button
            type="submit"
            className="brochure-modal__submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="brochure-modal__spinner" aria-hidden />
                Submitting…
              </>
            ) : (
              <>
                <FiDownload size={18} aria-hidden />
                Submit &amp; Download
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaYoutube,
  FaLinkedinIn,
  FaXTwitter,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
} from "react-icons/fa6";

const defaultConfig = {
  footerV2: {
    brandName: "",
    brandDescription: "",
    serviceAreas: [],
    reraItems: [],
    trustItems: [],
    legalLinks: [],
    socialLinks: [],
    badges: [],
    contactPhone: "",
    contactEmailLabel: "",
    contactEmailHref: "/contact",
    contactLocationTitle: "",
    contactLocationSub: "",
    enquireLabel: "Enquire Now",
    enquireLink: "/enquire",
    bottomText: "",
  },
};

const SOCIAL_ICON_MAP = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  whatsapp: FaWhatsapp,
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
};

async function openInquiryModal() {
  if (typeof window === "undefined") return;
  const modalEl = document.getElementById("modalInquiry");
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    return;
  }

  try {
    const bootstrapModule = await import("bootstrap/dist/js/bootstrap.esm");
    const ModalCtor = bootstrapModule?.Modal;
    if (!ModalCtor) return;
    ModalCtor.getOrCreateInstance(modalEl).show();
  } catch {}
}

export default function Footer1() {
  const [cfg, setCfg] = useState(defaultConfig);

  useEffect(() => {
    fetch("/api/website/footer-config")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.data) setCfg({ ...defaultConfig, ...res.data });
      })
      .catch(() => {});
  }, []);

  const v2 = cfg.footerV2 || defaultConfig.footerV2;
  const socialLinks = Array.isArray(v2.socialLinks)
    ? v2.socialLinks.filter((s) => s?.label)
    : [];
  const legalLinks = Array.isArray(v2.legalLinks) ? v2.legalLinks : [];
  const serviceAreas = Array.isArray(v2.serviceAreas) ? v2.serviceAreas : [];
  const reraItems = Array.isArray(v2.reraItems) ? v2.reraItems : [];
  const trustItems = Array.isArray(v2.trustItems) ? v2.trustItems : [];
  const badges = Array.isArray(v2.badges) ? v2.badges : [];

  return (
    <>
      <button
        type="button"
        className="footer-v2-enquire"
        aria-label={v2.enquireLabel || "Enquire Now"}
        onClick={() => {
          void openInquiryModal();
        }}
      >
        {v2.enquireLabel || "Enquire Now"}
      </button>

      <footer className="footer-v2-root">
        <div className="footer-v2-main">
          <div>
            <div className="footer-v2-brand-name">{v2.brandName}</div>
            <p className="footer-v2-brand-desc">{v2.brandDescription}</p>

            <div className="footer-v2-socials">
              {socialLinks.map((s, i) => {
                const Icon = SOCIAL_ICON_MAP[s.platform] || FaInstagram;
                const href = String(s.href || "").trim();
                return (
                  <a
                    key={`${s.label}-${i}`}
                    href={href || "#"}
                    target={/^https?:\/\//i.test(href) ? "_blank" : undefined}
                    rel={/^https?:\/\//i.test(href) ? "noopener noreferrer" : undefined}
                    aria-label={s.label}
                    className="footer-v2-social-btn"
                    style={{ color: s.color || "#fff" }}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>

            <div className="footer-v2-badges">
              {badges.map((badge, i) => (
                <div key={`${badge.title}-${i}`} className="footer-v2-badge">
                  <div className="footer-v2-badge-title">{badge.title}</div>
                  <div className="footer-v2-badge-sub">{badge.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-v2-heading">Service Areas</div>
            <ul className="footer-v2-list">
              {serviceAreas.map((area, i) => (
                <li key={`${area}-${i}`}>{area}</li>
              ))}
            </ul>
            {reraItems.length > 0 ? (
              <>
                <div className="footer-v2-heading footer-v2-rera-heading">RERA Details</div>
                <ul className="footer-v2-rera-list">
                  {reraItems.map((item, i) => (
                    <li key={`${item.label}-${i}`} className="footer-v2-rera-item">
                      <div className="footer-v2-rera-label">{item.label}</div>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer-v2-rera-link"
                        >
                          ({item.url})
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div>
            <div className="footer-v2-heading">Legal Links</div>
            <ul className="footer-v2-legal-list">
              {legalLinks.map((link, i) => (
                <li key={`${link.label}-${i}`}>
                  <Link href={link.href || "/"}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-v2-heading">Trust</div>
            <ul className="footer-v2-list">
              {trustItems.map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))}
            </ul>
            <div className="footer-v2-heading footer-v2-contact-heading">Contact</div>
            <div className="footer-v2-contact-stack">
              {v2.contactPhone ? (
                <a href={`tel:${v2.contactPhone}`} className="footer-v2-contact-card">
                  <span className="footer-v2-contact-icon">
                    <FaPhone />
                  </span>
                  <span className="footer-v2-contact-main">{v2.contactPhone}</span>
                </a>
              ) : null}

              {v2.contactEmailLabel ? (
                <a href={v2.contactEmailHref || "/contact"} className="footer-v2-contact-card">
                  <span className="footer-v2-contact-icon">
                    <FaEnvelope />
                  </span>
                  <span className="footer-v2-contact-main">{v2.contactEmailLabel}</span>
                </a>
              ) : null}

              {v2.contactLocationTitle ? (
                <div className="footer-v2-contact-card">
                  <span className="footer-v2-contact-icon">
                    <FaLocationDot />
                  </span>
                  <span>
                    <span className="footer-v2-contact-main">{v2.contactLocationTitle}</span>
                    {v2.contactLocationSub ? (
                      <span className="footer-v2-contact-sub">{v2.contactLocationSub}</span>
                    ) : null}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="footer-v2-bottom">{v2.bottomText}</div>
      </footer>
    </>
  );
}

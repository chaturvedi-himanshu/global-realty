"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const defaultConfig = {
  navLinks: [],
  topCities: [],
  topSubTypes: [],
  footerText: "",
  socialFacebook: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialInstagram: "",
};

/** Ensures Career & Team appear in Pages when removed from the main nav. */
const FOOTER_PAGE_EXTRAS = [
  { label: "Career", href: "/career" },
  { label: "Team", href: "/team" },
];

function mergeFooterPageLinks(links) {
  const base = Array.isArray(links) ? [...links] : [];
  for (const extra of FOOTER_PAGE_EXTRAS) {
    if (!base.some((l) => l.href === extra.href)) base.push(extra);
  }
  return base;
}

export default function Footer1({ logo = "/images/logo/logo.png" }) {
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "" });
  const [cfg, setCfg] = useState(defaultConfig);

  const pagesLinks = useMemo(
    () => mergeFooterPageLinks(cfg.navLinks),
    [cfg.navLinks],
  );

  useEffect(() => {
    fetch("/api/website/contact-info")
      .then((r) => r.json())
      .then((res) => {
        if (res?.data) {
          setContactInfo({
            phone: res.data.phones?.[0] || "",
            email: res.data.emails?.[0] || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/website/footer-config")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.data) setCfg({ ...defaultConfig, ...res.data });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const headings = document.querySelectorAll(".title-mobile");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");
      const content = parent.querySelector(".tf-collapse-content");

      if (parent.classList.contains("open")) {
        parent.classList.remove("open");
        content.style.height = "0px";
      } else {
        parent.classList.add("open");
        content.style.height = content.scrollHeight + 10 + "px";
      }
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, [pagesLinks.length, cfg.topCities.length, cfg.topSubTypes.length]);

  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        e.target.reset();
        setSuccess(true);
        handleShowMessage();
      } else {
        setSuccess(false);
        handleShowMessage();
      }
    } catch {
      setSuccess(false);
      handleShowMessage();
      e.target.reset();
    }
  };

  const copyright =
    cfg.footerText ||
    `Copyright © ${new Date().getFullYear()} Proty Real Estate`;

  const socials = [
    { url: cfg.socialFacebook, icon: "icon-fb", label: "Facebook" },
    { url: cfg.socialTwitter, icon: "icon-X", label: "X" },
    { url: cfg.socialLinkedin, icon: "icon-linked", label: "LinkedIn" },
    { url: cfg.socialInstagram, icon: "icon-ins", label: "Instagram" },
  ].filter((s) => s.url && /^https?:\/\//i.test(s.url));

  return (
    <footer id="footer">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="footer-top">
              <div className="footer-logo">
                <Link href={`/`}>
                  <Image
                    id="logo_footer"
                    alt="logo-footer"
                    src={logo}
                    width={272}
                    height={85}
                  />
                </Link>
              </div>
              <div className="wrap-contact-item">
                {contactInfo.phone && (
                  <div className="contact-item">
                    <div className="icons">
                      <i className="icon-phone-2" />
                    </div>
                    <div className="content">
                      <div className="title text-1">Call us</div>
                      <h6>
                        <a href={`tel:${contactInfo.phone}`}>
                          {contactInfo.phone}
                        </a>
                      </h6>
                    </div>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="contact-item">
                    <div className="icons">
                      <i className="icon-letter-2" />
                    </div>
                    <div className="content">
                      <div className="title text-1">Need live help</div>
                      <h6 className="fw-4">
                        <a href={`mailto:${contactInfo.email}`}>
                          {contactInfo.email}
                        </a>
                      </h6>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="footer-main">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="footer-menu-list footer-col-block">
                  <h5 className="title lh-30 title-desktop">Pages</h5>
                  <h5 className="title lh-30 title-mobile">Pages</h5>
                  <ul className="tf-collapse-content">
                    {pagesLinks.map((link, linkIndex) => (
                      <li key={`${link.href}-${linkIndex}`}>
                        {link.href.startsWith("/") ? (
                          <Link href={link.href}>{link.label}</Link>
                        ) : (
                          <a href={link.href}>{link.label}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="footer-menu-list footer-col-block">
                  <h5 className="title lh-30 title-desktop">Top cities</h5>
                  <h5 className="title lh-30 title-mobile">Top cities</h5>
                  <ul className="tf-collapse-content">
                    {cfg.topCities.length === 0 ? (
                      <li>
                        <span className="text-1" style={{ color: "var(--Note)" }}>
                          —
                        </span>
                      </li>
                    ) : (
                      cfg.topCities.map((c) => (
                        <li key={c.name}>
                          <Link href={c.href}>{c.name}</Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="footer-menu-list footer-col-block style-2">
                  <h5 className="title lh-30 title-desktop">Properties</h5>
                  <h5 className="title lh-30 title-mobile">Properties</h5>
                  <ul className="tf-collapse-content">
                    {cfg.topSubTypes.length === 0 ? (
                      <li>
                        <span className="text-1" style={{ color: "var(--Note)" }}>
                          —
                        </span>
                      </li>
                    ) : (
                      cfg.topSubTypes.map((t) => (
                        <li key={t._id}>
                          <Link href={t.href}>{t.name}</Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="footer-menu-list newsletter ">
                  <h5 className="title lh-30 mb-19">Newsletter</h5>
                  <div className="sib-form">
                    <div id="sib-form-container" className="sib-form-container">
                      <div
                        id="error-message"
                        className="sib-form-message-panel"
                      >
                        <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                          <svg
                            viewBox="0 0 512 512"
                            className="sib-icon sib-notification__icon"
                          >
                            <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
                          </svg>
                          <span className="sib-form-message-panel__inner-text">
                            Your subscription could not be saved. Please try
                            again.
                          </span>
                        </div>
                      </div>
                      <div
                        id="success-message"
                        className="sib-form-message-panel"
                      >
                        <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                          <svg
                            viewBox="0 0 512 512"
                            className="sib-icon sib-notification__icon"
                          >
                            <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z" />
                          </svg>
                          <span className="sib-form-message-panel__inner-text">
                            Your subscription has been successful.
                          </span>
                        </div>
                      </div>
                      <div
                        id="sib-container"
                        className="sib-container--large sib-container--vertical"
                      >
                        <div
                          className={`tfSubscribeMsg  footer-sub-element ${
                            showMessage ? "active" : ""
                          }`}
                        >
                          {success ? (
                            <p style={{ color: "rgb(52, 168, 83)" }}>
                              You have successfully subscribed.
                            </p>
                          ) : (
                            <p style={{ color: "red" }}>Something went wrong</p>
                          )}
                        </div>
                        <form onSubmit={sendEmail} id="sib-form">
                          <div className="sib-form-block ">
                            <div className="sib-text-form-block">
                              <div className="text-1">
                                Sign up to receive the latest articles
                              </div>
                            </div>
                          </div>
                          <div className="sib-input sib-form-block mb-11">
                            <div className="form__entry entry_block">
                              <div className="form__label-row mb-10">
                                <fieldset className="entry__field">
                                  <input
                                    className="input input-nl "
                                    type="email"
                                    id="EMAIL"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="Your email address"
                                    data-required="true"
                                    required
                                  />
                                </fieldset>
                              </div>
                              <label className="  entry__error entry__error--primary"></label>
                            </div>
                          </div>
                          <div className="sib-form-block">
                            <button
                              className="sib-form-block__button sib-form-block__button-with-loader tf-btn bg-color-primary  w-full"
                              form="sib-form"
                              type="submit"
                            >
                              <svg
                                className="icon clickable__icon progress-indicator__icon sib-hide-loader-icon"
                                viewBox="0 0 512 512"
                              >
                                <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
                              </svg>
                              Subscribe
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input
                        type="text"
                        name="email_address_check"
                        defaultValue=""
                        className="input--hidden"
                      />
                      <input type="hidden" name="locale" defaultValue="en" />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="footer-bottom">
            <p>{copyright}</p>
            {socials.length > 0 ? (
              <div className="wrap-social">
                <div className="text-3  fw-6 text_white">Follow us</div>
                <ul className="tf-social ">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                      >
                        <i className={s.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

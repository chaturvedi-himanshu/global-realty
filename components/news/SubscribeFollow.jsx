"use client";
import React, { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaXTwitter,
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa6";

const PLATFORM_META = {
  facebook:  { Icon: FaFacebookF,   color: "#1877F2", actionLabel: "Like" },
  twitter:   { Icon: FaTwitter,     color: "#1DA1F2", actionLabel: "Followers" },
  x:         { Icon: FaXTwitter,    color: "#000000", actionLabel: "Followers" },
  youtube:   { Icon: FaYoutube,     color: "#FF0000", actionLabel: "Subscribers" },
  instagram: { Icon: FaInstagram,   color: "#111111", actionLabel: "Followers" },
  linkedin:  { Icon: FaLinkedinIn,  color: "#0A66C2", actionLabel: "Followers" },
  whatsapp:  { Icon: FaWhatsapp,    color: "#25D366", actionLabel: "Chat" },
};

function isHttp(href) {
  return /^https?:\/\//i.test(String(href || "").trim());
}

export default function SubscribeFollow() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/website/footer-config")
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        const arr = Array.isArray(res?.data?.footerV2?.socialLinks)
          ? res.data.footerV2.socialLinks
          : [];
        const filtered = arr
          .filter((s) => s?.href && String(s.href).trim())
          .filter(
            (s) => PLATFORM_META[String(s.platform || "").toLowerCase()],
          );
        setLinks(filtered);
      })
      .catch(() => {
        if (!cancelled) setLinks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (links.length === 0) return null;

  return (
    <div className="news-widget subscribe-follow-widget">
      <h5 className="news-widget__title">Subscribe &amp; Follow</h5>
      <ul className="subscribe-follow__list">
        {links.map((s, i) => {
          const key = String(s.platform || "").toLowerCase();
          const meta = PLATFORM_META[key] || PLATFORM_META.facebook;
          const Icon = meta.Icon;
          const color = String(s.color || "").trim() || meta.color;
          const href = String(s.href || "").trim();
          const external = isHttp(href);
          const label = String(s.label || key).trim();

          return (
            <li
              key={`${key}-${i}`}
              className="subscribe-follow__item"
              style={{ "--brand": color }}
            >
              <a
                href={href || "#"}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-label={`${label} — ${meta.actionLabel}`}
                className="subscribe-follow__link"
              >
                <span className="subscribe-follow__brand">
                  <span className="subscribe-follow__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="subscribe-follow__name">{label}</span>
                </span>
                <span className="subscribe-follow__cta">
                  {meta.actionLabel}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

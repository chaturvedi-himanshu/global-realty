"use client";

import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaClock,
} from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { MdPeopleAlt } from "react-icons/md";

function telHref(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  return d ? `tel:${d}` : `tel:${String(raw || "").trim()}`;
}
function waHref(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  return `https://wa.me/${d}`;
}

const SOCIAL_META = {
  facebook:  { Icon: FaFacebookF,  bg: "#1877f2" },
  instagram: { Icon: FaInstagram,  bg: "#e1306c" },
  linkedin:  { Icon: FaLinkedinIn, bg: "#0077b5" },
  youtube:   { Icon: FaYoutube,    bg: "#ff0000" },
  whatsapp:  { Icon: FaWhatsapp,   bg: "#25d366" },
};

function InfoRow({ icon, label, children }) {
  return (
    <div className="ci-info-row">
      <div className="ci-info-row__icon">{icon}</div>
      <div className="ci-info-row__body">
        <span className="ci-info-row__label">{label}</span>
        <div className="ci-info-row__content">{children}</div>
      </div>
    </div>
  );
}

export default function ContactOfficeDetails({ contactInfo = {} }) {
  const phones    = (contactInfo.phones || []).filter(Boolean);
  const emailCats = (contactInfo.emailCategories || []).filter((c) => c.email);
  const social    = contactInfo.socialLinks || {};
  const actives   = Object.entries(social).filter(([, v]) => v);

  return (
    <div className="ci-office-panel">
      <div className="ci-office-panel__badge">Corporate Office</div>
      {contactInfo.reraNumber && (
        <p className="ci-office-panel__rera">RERA: {contactInfo.reraNumber}</p>
      )}

      {contactInfo.address && (
        <InfoRow icon={<FaMapMarkerAlt />} label="Office Address">
          <p style={{ whiteSpace: "pre-line", margin: 0 }}>{contactInfo.address}</p>
        </InfoRow>
      )}

      {contactInfo.workingHours && (
        <InfoRow icon={<FaClock />} label="Working Hours">
          <p style={{ margin: 0 }}>{contactInfo.workingHours}</p>
        </InfoRow>
      )}

      {phones.length > 0 && (
        <InfoRow icon={<FaPhone />} label="Phone">
          <div>
            {phones.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>}
                <a href={telHref(p)} className="ci-link">{p}</a>
              </React.Fragment>
            ))}
          </div>
        </InfoRow>
      )}

      {contactInfo.whatsappNumber && (
        <InfoRow icon={<FaWhatsapp style={{ color: "#25d366" }} />} label="WhatsApp">
          <a href={waHref(contactInfo.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="ci-link">
            {contactInfo.whatsappNumber}
          </a>
        </InfoRow>
      )}

      {contactInfo.salesPhone && (
        <InfoRow icon={<MdPeopleAlt />} label="Sales & Marketing">
          <a href={telHref(contactInfo.salesPhone)} className="ci-link">{contactInfo.salesPhone}</a>
        </InfoRow>
      )}

      {emailCats.length > 0 && (
        <div className="ci-email-section">
          <p className="ci-email-section__heading">
            <FaEnvelope style={{ marginRight: 8, verticalAlign: "middle" }} />
            Write to us
          </p>
          {emailCats.map((cat, i) => (
            <div key={i} className="ci-email-row">
              <span className="ci-email-row__label">{cat.label}</span>
              <a href={`mailto:${cat.email}`} className="ci-link ci-link--email">{cat.email}</a>
            </div>
          ))}
        </div>
      )}

      {actives.length > 0 && (
        <div className="ci-social">
          <p className="ci-social__label">Follow Us</p>
          <div className="ci-social__icons">
            {actives.map(([platform, url]) => {
              const meta = SOCIAL_META[platform];
              if (!meta) return null;
              const { Icon, bg } = meta;
              return (
                <a
                  key={platform}
                  href={String(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  className="ci-social__btn"
                  style={{ "--social-bg": bg }}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

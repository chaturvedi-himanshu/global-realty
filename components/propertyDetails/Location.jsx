import React from "react";

const getLabel = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value.name || "";
  if (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)) return "";
  return value;
};

export default function Location({ property }) {
  if (!property) return null;

  const { mapEmbedUrl, latitude, longitude, address, pincode, zipCode } = property;
  const city    = getLabel(property.city);
  const state   = getLabel(property.state);
  const country = getLabel(property.country);
  const postal  = pincode || zipCode || "";
  const embedUrl =
    mapEmbedUrl ||
    (latitude && longitude
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
      : null);

  if (!embedUrl) return null;

  return (
    <>
      <div className="wg-title text-11 fw-6 text-color-heading">
        Get Direction
      </div>
      <iframe
        className="map"
        src={embedUrl}
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Property Location"
      />
      <div className="info-map">
        <ul className="box-left">
          <li>
            <span className="label fw-6">Address</span>
            <div className="text text-variant-1">{address || "-"}</div>
          </li>
          <li>
            <span className="label fw-6">City</span>
            <div className="text text-variant-1">{city || "-"}</div>
          </li>
          <li>
            <span className="label fw-6">State</span>
            <div className="text text-variant-1">{state || "-"}</div>
          </li>
        </ul>
        <ul className="box-right">
          <li>
            <span className="label fw-6">Postal code</span>
            <div className="text text-variant-1">{postal || "-"}</div>
          </li>
          <li>
            <span className="label fw-6">Country</span>
            <div className="text text-variant-1">{country || "-"}</div>
          </li>
        </ul>
      </div>
    </>
  );
}

import React from "react";

export default function Features({ amenities = [], features = [] }) {
  if (!amenities.length && !features.length) return null;

  return (
    <>
      <div className="wg-title text-11 fw-6 text-color-heading">
        Amenities And Features
      </div>
      <div className="det-amenities-grid" role="list">
        {amenities.map((a) => (
          <div
            className="det-amenity-item feature-item"
            key={a._id || a.name}
            role="listitem"
          >
            {a.name}
          </div>
        ))}
      </div>
    </>
  );
}

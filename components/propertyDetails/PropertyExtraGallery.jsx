"use client";

import Image from "next/image";
import { useMemo } from "react";
import { normalizePropertyImageUrls } from "@/lib/normalizePropertyImages";
import { usePropertyDetailLightbox } from "@/contexts/PropertyDetailLightboxContext";

export default function PropertyExtraGallery({ property }) {
  const { openAt } = usePropertyDetailLightbox();

  const allUrls = useMemo(
    () =>
      normalizePropertyImageUrls(
        property?.images || [],
        property?.title || "Property",
      ),
    [property?.images, property?.title],
  );

  if (allUrls.length <= 3) return null;

  return (
    <div className="wg-property box-property-detail property-extra-gallery">
      <h3 className="title fw-7 text-color-heading mb-20">Gallery</h3>
      <div className="property-extra-gallery__grid">
        {allUrls.map((url, globalIndex) => (
            <button
              key={`${url}-${globalIndex}`}
              type="button"
              className="property-extra-gallery__cell"
              onClick={() => openAt(globalIndex)}
            >
              <Image
                src={url}
                alt={`${property?.title || "Property"} — photo ${globalIndex + 1}`}
                width={480}
                height={320}
                className="property-extra-gallery__img"
                unoptimized
              />
            </button>
        ))}
      </div>
    </div>
  );
}

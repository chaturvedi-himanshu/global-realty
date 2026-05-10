"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { normalizePropertyImageUrls } from "@/lib/normalizePropertyImages";

const PropertyDetailLightboxContext = createContext(null);

export function PropertyDetailLightboxProvider({ property, children }) {
  const slides = useMemo(() => {
    const urls = normalizePropertyImageUrls(
      property?.images || [],
      property?.title || "Property",
    );
    return urls.map((src) => ({ src, alt: property?.title || "Property" }));
  }, [property?.images, property?.title]);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = useCallback(
    (i) => {
      if (!slides.length) return;
      const safe = Math.max(0, Math.min(i, slides.length - 1));
      setIndex(safe);
      setOpen(true);
    },
    [slides.length],
  );

  const value = useMemo(
    () => ({ openAt, slides, slideCount: slides.length }),
    [openAt, slides],
  );

  return (
    <PropertyDetailLightboxContext.Provider value={value}>
      {children}
      {slides.length > 0 && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={slides}
          on={{ view: ({ index: next }) => setIndex(next) }}
          carousel={{ finite: slides.length <= 1 }}
          controller={{ closeOnBackdropClick: true }}
        />
      )}
    </PropertyDetailLightboxContext.Provider>
  );
}

export function usePropertyDetailLightbox() {
  const ctx = useContext(PropertyDetailLightboxContext);
  if (!ctx) {
    throw new Error(
      "usePropertyDetailLightbox must be used within PropertyDetailLightboxProvider",
    );
  }
  return ctx;
}

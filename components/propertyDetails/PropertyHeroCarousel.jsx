"use client";

import Image from "next/image";
import { useMemo, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import {
  FiMapPin,
  FiClock,
  FiAlignLeft,
  FiShare2,
  FiPrinter,
  FiShuffle,
} from "react-icons/fi";
import { useComparison, MAX_COMPARE } from "@/components/compare/PropertyComparison";
import { formatPropertyPriceCrLac } from "@/lib/formatPropertyPriceIN";
import { normalizePropertyImageUrls } from "@/lib/normalizePropertyImages";
import { usePropertyDetailLightbox } from "@/contexts/PropertyDetailLightboxContext";

const getLabel = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value.name || "";
  if (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)) return "";
  return value;
};

function formatAvailableLabel(from) {
  if (!from) return "";
  const d = new Date(from);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PropertyHeroCarousel({ property }) {
  const { openAt } = usePropertyDetailLightbox();
  const { addToCompare, removeFromCompare, isInCompare, count } = useComparison();
  const [active, setActive] = useState(0);
  const swiperRef = useRef(null);
  const propertyId = property?._id;
  const inCompare = propertyId ? isInCompare(propertyId) : false;

  const allUrls = useMemo(
    () =>
      normalizePropertyImageUrls(
        property?.images || [],
        property?.title || "Property",
      ),
    [property?.images, property?.title],
  );

  const heroUrls = useMemo(() => allUrls.slice(0, 3), [allUrls]);

  const city = getLabel(property?.city);
  const state = getLabel(property?.state);
  const locationLine = [property?.address, city, state].filter(Boolean).join(", ");

  const listingType = String(property?.listingType || "").toLowerCase();
  const badge =
    listingType === "rent" || listingType === "lease"
      ? "For Rent"
      : "For Sale";

  const priceLine = formatPropertyPriceCrLac(
    property?.price,
    property?.priceType,
    property?.currency || "INR",
  );

  const spec = String(property?.specification || "").trim();
  const specShort =
    spec.length > 140 ? `${spec.slice(0, 137).trim()}…` : spec || "—";

  const availableLabel = formatAvailableLabel(property?.availableFrom);

  const share = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: property?.title || "Property",
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled share */
    }
  }, [property?.title]);

  const printPage = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  const handleCompare = () => {
    if (!propertyId) return;
    if (inCompare) {
      removeFromCompare(propertyId);
      toast.success("Removed from compare");
      return;
    }
    if (count >= MAX_COMPARE) {
      toast.error(`You can compare up to ${MAX_COMPARE} properties`);
      return;
    }
    addToCompare(propertyId);
    toast.success("Added to compare");
  };

  if (!heroUrls.length) return null;

  return (
    <section className="property-detail-hero">
      <Swiper
        className="property-detail-hero__swiper"
        modules={[Autoplay, A11y, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        spaceBetween={0}
        loop={false}
        rewind={heroUrls.length > 1}
        speed={900}
        autoplay={
          heroUrls.length > 1
            ? {
                delay: 3000,
                disableOnInteraction: false,
              }
            : false
        }
        onSwiper={(sw) => {
          swiperRef.current = sw;
          setActive(sw.activeIndex);
        }}
        onSlideChange={(sw) => setActive(sw.activeIndex)}
        a11y={{ enabled: true }}
      >
        {heroUrls.map((url, i) => (
          <SwiperSlide key={`${url}-${i}`}>
            <button
              type="button"
              className="property-detail-hero__slide"
              onClick={() => openAt(i)}
              aria-label={`Open image ${i + 1} in gallery`}
            >
              <Image
                src={url}
                alt={property?.title || "Property"}
                fill
                className="property-detail-hero__img"
                sizes="100vw"
                priority={i === 0}
                unoptimized
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="property-detail-hero__gradient" aria-hidden />

      <div className="property-detail-hero__overlay">
        <div className="property-detail-hero__overlay-inner tf-container">
          <div className="property-detail-hero__copy">
            <span className="property-detail-hero__badge">{badge}</span>
            {property?.title ? (
              <h1 className="property-detail-hero__title">{property.title}</h1>
            ) : null}

            <div className="property-detail-hero__meta">
              {locationLine ? (
                <span className="property-detail-hero__meta-item">
                  <FiMapPin className="property-detail-hero__meta-icon" aria-hidden />
                  {locationLine}
                </span>
              ) : null}
              {availableLabel ? (
                <span className="property-detail-hero__meta-item">
                  <FiClock className="property-detail-hero__meta-icon" aria-hidden />
                  {availableLabel}
                </span>
              ) : null}
              <span className="property-detail-hero__meta-item property-detail-hero__meta-item--spec">
                <FiAlignLeft className="property-detail-hero__meta-icon" aria-hidden />
                <span className="property-detail-hero__spec-text">{specShort}</span>
              </span>
            </div>

            {priceLine ? (
              <p className="property-detail-hero__price">{priceLine}</p>
            ) : null}
          </div>

          <div className="property-detail-hero__actions">
            {propertyId ? (
              <button
                type="button"
                className={`property-detail-hero__icon-btn${inCompare ? " property-detail-hero__icon-btn--compare-active" : ""}`}
                onClick={handleCompare}
                aria-label={inCompare ? "Remove from compare" : "Add to compare"}
                title={inCompare ? "Remove from compare" : "Compare"}
              >
                <FiShuffle size={20} />
              </button>
            ) : null}
            <button
              type="button"
              className="property-detail-hero__icon-btn"
              onClick={share}
              aria-label="Share listing"
            >
              <FiShare2 size={20} />
            </button>
            <button
              type="button"
              className="property-detail-hero__icon-btn"
              onClick={printPage}
              aria-label="Print page"
            >
              <FiPrinter size={20} />
            </button>
          </div>
        </div>
      </div>

      {heroUrls.length > 1 ? (
        <div
          className="property-detail-hero__dots"
          role="tablist"
          aria-label="Hero images"
        >
          {heroUrls.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`property-detail-hero__dot${active === i ? " is-active" : ""}`}
              aria-label={`Show image ${i + 1}`}
              aria-current={active === i ? "true" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                const sw = swiperRef.current;
                if (!sw) return;
                sw.slideTo(i);
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

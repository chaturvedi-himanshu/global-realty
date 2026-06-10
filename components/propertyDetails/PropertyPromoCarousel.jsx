"use client";

import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const fetcher = (url) => api.get(url).then((r) => r.data);

const SITE_CONFIG_KEY = "propertyDetailSidebarImages";

async function openInquiryModal() {
  if (typeof window === "undefined") return;
  const modalEl = document.getElementById("modalInquiry");
  if (!modalEl) return;
  if (modalEl.classList.contains("show")) return;

  if (window.bootstrap?.Modal) {
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    return;
  }
  try {
    const bootstrapModule = await import("bootstrap/dist/js/bootstrap.esm");
    const ModalCtor = bootstrapModule?.Modal;
    if (!ModalCtor) return;
    ModalCtor.getOrCreateInstance(modalEl).show();
  } catch {
    // bootstrap not yet hydrated; ignore
  }
}

function normalizeImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { url: item.trim(), alt: "" };
      if (item && typeof item === "object") {
        const url = String(item.url || item.src || item.image || "").trim();
        return url ? { url, alt: String(item.alt || "").trim() } : null;
      }
      return null;
    })
    .filter((img) => img?.url);
}

export default function PropertyPromoCarousel() {
  const { data, isLoading } = useSWR("/site-config", fetcher);
  const images = normalizeImages(data?.data?.[SITE_CONFIG_KEY]);

  if (isLoading || !images.length) return null;

  const hasMultiple = images.length > 1;

  return (
    <section
      className="property-promo-carousel"
      aria-label="Featured promotions"
    >
      <div className="property-promo-carousel__card">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          loop={hasMultiple}
          pagination={hasMultiple ? { clickable: true } : false}
          autoplay={
            hasMultiple
              ? { delay: 1000, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          className="property-promo-carousel__swiper"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`${img.url}-${idx}`}>
              <div className="property-promo-carousel__slide">
                <Image
                  src={img.url}
                  alt={img.alt || "Promotion"}
                  fill
                  sizes="(max-width: 991px) 100vw, 33vw"
                  className="property-promo-carousel__img"
                  priority={idx === 0}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="property-promo-carousel__cta"
          onClick={() => void openInquiryModal()}
          aria-haspopup="dialog"
          aria-controls="modalInquiry"
        >
          Book Now
        </button>
      </div>
    </section>
  );
}

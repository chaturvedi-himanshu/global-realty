"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/lib/hooks/useCMS";

const CAROUSEL_INTERVAL_MS = 2000;

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
  } catch {
    // bootstrap not yet hydrated; ignore
  }
}

const SCROLL_REOPEN_OFFSET_PX = 1300;

function resolvePopupImages(config) {
  const fromList = Array.isArray(config?.inquiryPopupImages)
    ? config.inquiryPopupImages
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];
  if (fromList.length) return fromList;

  const legacy = String(config?.inquiryPopupImage || "").trim();
  return legacy ? [legacy] : [];
}

export default function FloatingInquiryPopup() {
  const { data } = useSiteConfig();
  const pathname = usePathname();
  const [phase, setPhase] = useState("card");
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);
  const carouselTimerRef = useRef(null);
  const lastPathRef = useRef(pathname);
  const closedAtScrollRef = useRef(null);
  const ANIMATION_MS = 360;

  const config = data?.data || {};
  const enabled = useMemo(() => {
    if (typeof config.inquiryPopupEnabled === "boolean") return config.inquiryPopupEnabled;
    if (typeof config.inquiryPopupEnabled === "string") return config.inquiryPopupEnabled === "true";
    return false;
  }, [config.inquiryPopupEnabled]);

  const images = useMemo(() => resolvePopupImages(config), [config]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setActiveSlide(0);
    if (carouselTimerRef.current) {
      clearInterval(carouselTimerRef.current);
      carouselTimerRef.current = null;
    }
    if (images.length <= 1) return undefined;

    carouselTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % images.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
        carouselTimerRef.current = null;
      }
    };
  }, [images]);

  const runPhaseTransition = (nextPhase, endPhase) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase(nextPhase);
    timerRef.current = setTimeout(() => {
      setPhase(endPhase);
      timerRef.current = null;
    }, ANIMATION_MS);
  };

  const closeCard = () => {
    if (phase !== "card") return;
    closedAtScrollRef.current =
      typeof window !== "undefined" ? window.scrollY : 0;
    runPhaseTransition("toHidden", "hidden");
  };

  const reopenCard = () => {
    closedAtScrollRef.current = null;
    runPhaseTransition("toCard", "card");
  };

  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    if (phase === "hidden" || phase === "toHidden") {
      reopenCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (phase !== "hidden") return undefined;

    const onScroll = () => {
      const closedAt = closedAtScrollRef.current;
      if (closedAt == null) return;
      if (window.scrollY >= closedAt + SCROLL_REOPEN_OFFSET_PX) {
        reopenCard();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!enabled || images.length === 0) return null;

  return (
    <div
      className={[
        "floating-inquiry-card",
        phase === "hidden" ? "floating-inquiry-card--hidden" : "",
        phase === "toHidden" ? "floating-inquiry-card--to-icon" : "",
        phase === "toCard" ? "floating-inquiry-card--to-card" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="complementary"
      aria-label="Quick inquiry"
    >
      <button
        type="button"
        className="floating-inquiry-card__close"
        onClick={closeCard}
        aria-label="Close inquiry popup"
      >
        ×
      </button>
      <button
        type="button"
        className="floating-inquiry-card__image-btn"
        onClick={() => {
          void openInquiryModal();
        }}
        aria-label="Open inquiry form"
      >
        <div className="floating-inquiry-card__carousel" aria-live="polite">
          {images.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${index}`}
              src={src}
              alt={`Inquiry offer ${index + 1}`}
              className={[
                "floating-inquiry-card__image",
                index === activeSlide ? "floating-inquiry-card__image--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </button>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/lib/hooks/useCMS";

async function openInquiryModal() {
  if (typeof window === "undefined") return;
  const modalEl = document.getElementById("modalInquiry");
  if (!modalEl) return;

  // Works both when bootstrap is already attached to window and when it is only available as ESM import.
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
    // swallow: no-op if bootstrap fails to load in edge runtime states
  }
}

export default function FloatingInquiryPopup() {
  const { data } = useSiteConfig();
  const pathname = usePathname();
  const [phase, setPhase] = useState("card");
  const timerRef = useRef(null);
  const lastPathRef = useRef(pathname);
  const ANIMATION_MS = 360;

  const config = data?.data || {};
  const enabled = useMemo(() => {
    if (typeof config.inquiryPopupEnabled === "boolean") return config.inquiryPopupEnabled;
    if (typeof config.inquiryPopupEnabled === "string") return config.inquiryPopupEnabled === "true";
    return false;
  }, [config.inquiryPopupEnabled]);
  const imageUrl = typeof config.inquiryPopupImage === "string" ? config.inquiryPopupImage : "";

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const runPhaseTransition = (nextPhase, endPhase) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase(nextPhase);
    timerRef.current = setTimeout(() => {
      setPhase(endPhase);
      timerRef.current = null;
    }, ANIMATION_MS);
  };

  /**
   * Re-open the popup whenever the user navigates to a different route, even
   * if they had minimised it on the previous page.
   */
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    if (phase === "icon" || phase === "toIcon") {
      runPhaseTransition("toCard", "card");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const closeToIcon = () => {
    if (phase !== "card") return;
    runPhaseTransition("toIcon", "icon");
  };

  const openFromIcon = () => {
    if (phase !== "icon") return;
    runPhaseTransition("toCard", "card");
  };

  if (!enabled || !imageUrl) return null;

  return (
    <>
      <div
        className={[
          "floating-inquiry-card",
          phase === "icon" ? "floating-inquiry-card--hidden" : "",
          phase === "toIcon" ? "floating-inquiry-card--to-icon" : "",
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
          onClick={closeToIcon}
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Inquiry offer" className="floating-inquiry-card__image" />
        </button>
      </div>

      <button
        type="button"
        className={[
          "floating-inquiry-reopen",
          phase === "card" ? "floating-inquiry-reopen--hidden" : "",
          phase === "toIcon" ? "floating-inquiry-reopen--to-icon" : "",
          phase === "toCard" ? "floating-inquiry-reopen--to-card" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={openFromIcon}
        aria-label="Reopen inquiry popup"
      >
        <span className="floating-inquiry-reopen__badge" aria-hidden>
          HOT DEAL
        </span>
        <span className="floating-inquiry-reopen__spark floating-inquiry-reopen__spark--1" aria-hidden />
        <span className="floating-inquiry-reopen__spark floating-inquiry-reopen__spark--2" aria-hidden />
        <span className="floating-inquiry-reopen__icon" aria-hidden>
          %
        </span>
      </button>
    </>
  );
}

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

const SCROLL_REOPEN_OFFSET_PX = 1300;

export default function FloatingInquiryPopup() {
  const { data } = useSiteConfig();
  const pathname = usePathname();
  const [phase, setPhase] = useState("card");
  const timerRef = useRef(null);
  const lastPathRef = useRef(pathname);
  const closedAtScrollRef = useRef(null);
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

  /**
   * Re-open the popup whenever the user navigates to a different route, even
   * if they had closed it on the previous page.
   */
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    if (phase === "hidden" || phase === "toHidden") {
      reopenCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /**
   * When closed, listen for scroll. As soon as the user scrolls
   * SCROLL_REOPEN_OFFSET_PX below where they closed it, bring the card back.
   */
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

  if (!enabled || !imageUrl) return null;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Inquiry offer" className="floating-inquiry-card__image" />
      </button>
    </div>
  );
}

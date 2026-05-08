"use client";
import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import BackToTop from "@/components/common/BackToTop";
import MobileMenu from "@/components/headers/MobileMenu";
import SettingsHandler from "@/components/common/SettingsHandler";
import Login from "@/components/modals/Login";
import Register from "@/components/modals/Register";
import CompareBar from "@/components/compare/CompareBar";
import InquiryModal from "@/components/modals/InquiryModal";
import FloatingInquiryPopup from "@/components/common/FloatingInquiryPopup";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const wowRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm");
    }
  }, []);

  useEffect(() => {
    const bootstrap = require("bootstrap");
    const modalElements = document.querySelectorAll(".modal.show");
    modalElements.forEach((modal) => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) modalInstance.hide();
    });
    const offcanvasElements = document.querySelectorAll(".offcanvas.show");
    offcanvasElements.forEach((offcanvas) => {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
      if (offcanvasInstance) offcanvasInstance.hide();
    });
  }, [pathname]);

  // WOW.js — properly managed with cleanup to prevent listener accumulation
  useEffect(() => {
    // Stop and discard any previous WOW instance before creating a new one
    if (wowRef.current) {
      try { wowRef.current.stop(); } catch { /* ignore */ }
      wowRef.current = null;
    }

    // Use rAF so the DOM is fully painted before WOW hides elements —
    // this avoids the invisible-flash on back navigation
    const rafId = requestAnimationFrame(() => {
      try {
        const WOW = require("@/utlis/wow");
        const wow = new WOW.default({
          animateClass: "animated",
          offset: 100,
          mobile: true,
          live: false,
        });
        wow.init();
        // Force an immediate viewport check so above-the-fold elements
        // are never left invisible after route changes or bfcache restore
        wow.scrolled = true;
        wowRef.current = wow;
      } catch { /* ignore SSR or import errors */ }
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (wowRef.current) {
        try { wowRef.current.stop(); } catch { /* ignore */ }
        wowRef.current = null;
      }
    };
  }, [pathname]);

  // Handle browser back-forward cache (bfcache) restoration.
  // When the browser restores a page from bfcache (persisted === true),
  // WOW.js has stale state. Force a viewport re-check to reveal hidden elements.
  useEffect(() => {
    const handlePageShow = (e) => {
      if (!e.persisted) return;
      if (wowRef.current) {
        wowRef.current.scrolled = true;
      } else {
        // WOW hasn't initialised yet for this restore — make all wow elements
        // visible immediately so nothing is stuck hidden
        document.querySelectorAll(".wow").forEach((el) => {
          el.style.visibility = "visible";
        });
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    const handleSticky = () => {
      const navbar =
        document.querySelector("#header-main") || document.querySelector(".header");
      if (!navbar) return;
      if (window.scrollY > 120) {
        navbar.classList.add("fixed", "header-sticky");
      } else {
        navbar.classList.remove("fixed", "header-sticky", "is-sticky");
      }
      if (window.scrollY > 300) {
        navbar.classList.add("is-sticky");
      } else {
        navbar.classList.remove("is-sticky");
      }
    };
    handleSticky();
    window.addEventListener("scroll", handleSticky, { passive: true });
    return () => window.removeEventListener("scroll", handleSticky);
  }, [pathname]);

  return (
    <>
      <Suspense fallback={null}>{children}</Suspense>
      <Suspense fallback={null}>
        <MobileMenu />
      </Suspense>
      <BackToTop />
      <SettingsHandler />
      <Login />
      <Register />
      <InquiryModal />
      <FloatingInquiryPopup />
      <CompareBar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: "8px", fontSize: "14px" },
        }}
      />
    </>
  );
}

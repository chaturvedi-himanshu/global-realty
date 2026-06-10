"use client";

import { FiPhone } from "react-icons/fi";
import styles from "./HomeCtaBanner.module.css";

const FALLBACK = {
  heading: "Let's Talk About Your Dream Property",
  buttonText: "Contact Us",
  buttonLink: "/contact",
  backgroundImage: "/images/cta-bg.jpg",
  overlayColor: "#0a141e",
  overlayOpacity: 0.78,
  isActive: true,
};

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

function hexToRgba(color, opacity) {
  if (!color || typeof color !== "string") {
    return `rgba(10, 20, 30, ${opacity})`;
  }
  const clean = color.replace("#", "").trim();
  if (clean.length !== 6) return `rgba(10, 20, 30, ${opacity})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function HomeCtaBanner({ content }) {
  const c = {
    ...FALLBACK,
    ...(content || {}),
  };

  if (!c.isActive) return null;

  const bgImage = c.backgroundImage || FALLBACK.backgroundImage;
  const overlayOpacity =
    Number.isFinite(Number(c.overlayOpacity)) ? Math.min(1, Math.max(0, Number(c.overlayOpacity))) : FALLBACK.overlayOpacity;
  const overlay = hexToRgba(c.overlayColor || FALLBACK.overlayColor, overlayOpacity);

  return (
    <section className={styles.banner}>
      <div
        className={styles.bgLayer}
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className={styles.overlay} style={{ background: overlay }} />

      <h2 className={styles.heading}>{c.heading}</h2>
      <button
        type="button"
        className={styles.btn}
        onMouseEnter={() => {
          void openInquiryModal();
        }}
        onFocus={() => {
          void openInquiryModal();
        }}
        onClick={() => {
          void openInquiryModal();
        }}
        aria-haspopup="dialog"
        aria-controls="modalInquiry"
      >
        <FiPhone className={styles.btnIcon} size={18} aria-hidden />
        <span>{c.buttonText || "Contact Us"}</span>
      </button>
    </section>
  );
}

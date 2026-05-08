"use client";

import Link from "next/link";
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
      <Link href={c.buttonLink || "/contact"} className={styles.btn}>
        {c.buttonText || "Contact Us"}
      </Link>
    </section>
  );
}

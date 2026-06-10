"use client";

import { useMemo, useState } from "react";
import styles from "./PropertyAccordion.module.css";

const FALLBACK_PANELS = [
  {
    key: "residential",
    label: "RESIDENTIAL",
    tagline: "Homes designed for the way you live and grow.",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80",
    href: "#residential",
  },
  {
    key: "retail",
    label: "RETAIL",
    tagline: "Spaces that turn footfall into lasting brands.",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=900&q=80",
    href: "#retail",
  },
  {
    key: "offices",
    label: "OFFICES",
    tagline: "Business environments that inspire success and productivity.",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
    href: "#offices",
  },
];

export default function PropertyAccordion({ panels = [] }) {
  const items = useMemo(
    () =>
      (Array.isArray(panels) && panels.length
        ? panels
        : FALLBACK_PANELS
      ).filter((p) => p?.label && p?.image),
    [panels]
  );
  const [hovered, setHovered] = useState("");

  if (!items.length) return null;

  return (
    <div className={styles.wrap}>
        {items.map((panel) => {
          const isHovered = hovered === panel.key;
          return (
            <div
              key={panel.key}
              className={`${styles.panel} ${isHovered ? styles.isHovered : ""}`}
              onMouseEnter={() => setHovered(panel.key)}
              onMouseLeave={() => setHovered("")}
              role="button"
              tabIndex={0}
              aria-expanded={isHovered}
              onFocus={() => setHovered(panel.key)}
              onBlur={() => setHovered("")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setHovered(panel.key);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={panel.image} alt={panel.label} className={styles.panelImg} />
              <div className={styles.overlay} />
              <div className={styles.label}>{panel.label}</div>
              <div className={styles.content}>
                <p className={styles.tagline}>{panel.tagline}</p>
                <a href={panel.href || "#"} className={styles.btn}>
                  View Projects
                </a>
              </div>
            </div>
          );
        })}
      </div>
  );
}

"use client";

import { useEffect, useState } from "react";

function AnimatedCount({ value, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const target = Math.max(0, Number(value) || 0);
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <>{displayValue.toLocaleString("en-IN")}</>;
}

export default function AboutHeroStatsBand({
  stats = [],
  backgroundImage = "",
  overlayColor = "rgba(31, 41, 55, 0.7)",
}) {
  const validStats = Array.isArray(stats)
    ? stats.filter((item) => item?.label && Number(item?.value || 0) > 0)
    : [];

  if (validStats.length === 0) return null;

  const hasImage = Boolean(backgroundImage);

  return (
    <section className="about-v2-stats-band">
      <div className="tf-container">
        <div
          className="about-v2-stats-band__inner"
          style={{
            backgroundColor: overlayColor || undefined,
            backgroundImage: hasImage ? `url(${backgroundImage})` : undefined,
          }}
        >
          {hasImage ? (
            <div
              className="about-v2-stats-band__overlay"
              style={{ background: overlayColor }}
              aria-hidden="true"
            />
          ) : null}
          <div className="hero-stats-grid about-v2-stats-band__grid">
            {validStats.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="hero-stat-card about-v2-stats-band__card"
              >
                <h4 className="hero-stat-card__value">
                  <AnimatedCount value={item.value} />
                  {item.suffix || ""}
                </h4>
                <p className="hero-stat-card__label">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

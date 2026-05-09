"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/** Repeat logos so Swiper `loop` has enough slides on wide breakpoints. */
function expandForMarquee(logos) {
  if (!Array.isArray(logos) || !logos.length) return [];
  const minSlides = 14;
  const out = [];
  let i = 0;
  while (out.length < minSlides) {
    const item = logos[i % logos.length];
    out.push({
      ...item,
      _slideKey: `${String(item._id ?? item.image)}-${out.length}`,
    });
    i += 1;
  }
  return out;
}

export default function BrandSlider({
  parentClass = "infiniteslide wrap-partners",
  logos = [],
}) {
  const slides = useMemo(() => expandForMarquee(logos), [logos]);

  if (!slides.length) return null;

  const inner = (logo) => {
    const img = (
      <Image
        src={logo.image}
        alt={logo.name || "Partner"}
        width={160}
        height={72}
        style={{
          width: "auto",
          maxWidth: 160,
          height: "auto",
          maxHeight: 72,
          objectFit: "contain",
        }}
      />
    );

    const href = (logo.link || "").trim();
    if (!href) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
          {img}
        </div>
      );
    }
    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          className="d-flex align-items-center justify-content-center h-100"
        >
          {img}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className="d-flex align-items-center justify-content-center h-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        {img}
      </a>
    );
  };

  return (
    <Swiper
      dir="ltr"
      className={parentClass}
      spaceBetween={15}
      breakpoints={{
        0: { slidesPerView: 2 },
        575: { slidesPerView: 3 },
        768: { slidesPerView: 4, spaceBetween: 30 },
        992: { slidesPerView: 6, spaceBetween: 30 },
      }}
      loop={slides.length > 3}
      autoplay={{ delay: 1, pauseOnMouseEnter: true }}
      speed={2000}
      modules={[Autoplay]}
    >
      {slides.map((logo) => (
        <SwiperSlide className="partner-item style-2" key={logo._slideKey}>
          {inner(logo)}
      </SwiperSlide>
      ))}
    </Swiper>
  );
}

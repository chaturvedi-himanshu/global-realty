"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import styles from "./Testimonials.module.css";

function designationOnly(item) {
  return String(item.designation || item.role || "").trim();
}

/** Retry with muted playback if the browser blocks unmuted play (common on mobile). */
function playWithFallback(v) {
  if (!v) return;
  const attempt = v.play();
  if (attempt === undefined) return;
  attempt.catch(() => {
    const wasMuted = v.muted;
    v.muted = true;
    const again = v.play();
    if (again !== undefined) {
      again
        .then(() => {
          v.muted = wasMuted;
        })
        .catch(() => {
          v.muted = wasMuted;
        });
    }
  });
}

function VideoTestimonialCard({ item }) {
  const modalVideoRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const openLightbox = () => setLightboxOpen(true);

  const closeLightbox = () => {
    modalVideoRef.current?.pause();
    setLightboxOpen(false);
  };

  useLayoutEffect(() => {
    if (!lightboxOpen) return;
    const video = modalVideoRef.current;
    if (!video) return;

    const kick = () => playWithFallback(video);

    kick();
    const raf = requestAnimationFrame(kick);
    video.addEventListener("loadeddata", kick, { once: true });
    video.addEventListener("canplay", kick, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", kick);
      video.removeEventListener("canplay", kick);
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        modalVideoRef.current?.pause();
        setLightboxOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  const handleMediaStackClick = (e) => {
    if (e.target instanceof Element && e.target.closest("button")) return;
    openLightbox();
  };

  const designation = designationOnly(item);
  const company = String(item.company || "").trim();
  const logoUrl = String(item.brandLogo || "").trim();
  const hasBrand = Boolean(logoUrl || company);
  const posterUrl = (item.avatar && String(item.avatar).trim()) || "";

  const lightbox =
    portalReady &&
    lightboxOpen &&
    createPortal(
      <div
        className={styles.lightboxBackdrop}
        role="dialog"
        aria-modal="true"
        aria-label={`Video — ${item.name || "Testimonial"}`}
        onClick={closeLightbox}
      >
        <div
          className={styles.lightboxStage}
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {posterUrl ? (
            <>
              <div className={styles.lightboxBgWrap} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterUrl} alt="" className={styles.lightboxBgImg} />
              </div>
              <div className={styles.lightboxBgScrim} aria-hidden />
            </>
          ) : null}
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close video"
            onClick={closeLightbox}
          >
            <svg
              className={styles.lightboxCloseIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={styles.lightboxVideoSlot}>
            <video
              ref={modalVideoRef}
              className={styles.lightboxVideo}
              src={item.video}
              autoPlay
              controls
              playsInline
              preload="auto"
            />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className={`${styles.card} swiper-no-swiping`}>
      {lightbox}
      <div
        className={styles.mediaStack}
        onClick={handleMediaStackClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open video — ${item.name || "testimonial"}`}
      >
        <video
          className={styles.mediaFill}
          playsInline
          preload="none"
          poster={item.avatar ? String(item.avatar) : undefined}
          aria-hidden
        />
        <div className={styles.bottomGrad} aria-hidden />
        <div className={styles.playOverlay}>
          <span className={styles.playRing} aria-hidden />
          <button
            type="button"
            className={styles.playBtn}
            aria-label={`Play video — ${item.name || "Testimonial"}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openLightbox();
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
      {hasBrand ? (
        <div className={styles.brand}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={company || "Brand"} className={styles.brandImg} />
          ) : (
            <span className={styles.brandText}>{company}</span>
          )}
        </div>
      ) : null}
      <div className={styles.meta}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.accentBar} aria-hidden />
        {designation ? <div className={styles.designation}>{designation}</div> : null}
      </div>
    </div>
  );
}

function TextTestimonialCard({ item }) {
  const text = item.message || item.review || item.content || "";
  const designation = designationOnly(item);
  const company = String(item.company || "").trim();
  const logoUrl = String(item.brandLogo || "").trim();
  const hasBrand = Boolean(logoUrl || company);
  const bg =
    (item.avatar && String(item.avatar).trim()) || "/images/avatar/avt-png5.png";

  return (
    <div className={`${styles.card} swiper-no-swiping`}>
      <div className={styles.fallbackBg} style={{ backgroundImage: `url(${bg})` }} aria-hidden />
      <div className={styles.fallbackOverlay} aria-hidden />
      <div className={styles.bottomGrad} aria-hidden />
      {hasBrand ? (
        <div className={styles.brand}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={company || "Brand"} className={styles.brandImg} />
          ) : (
            <span className={styles.brandText}>{company}</span>
          )}
        </div>
      ) : null}
      {text ? (
        <div className={styles.quoteBody}>
          <p className={styles.quoteText}>{text}</p>
        </div>
      ) : null}
      <div className={styles.meta}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.accentBar} aria-hidden />
        {designation ? <div className={styles.designation}>{designation}</div> : null}
      </div>
    </div>
  );
}

export default function Testimonials({ testimonials: dbTestimonials = [] }) {
  const items = dbTestimonials.filter(
    (t) => t?.video || t?.message || t?.review || t?.content
  );
  if (!items.length) return null;

  return (
    <div className="section-testimonials style-1 tf-spacing-1 testimonials-video-row">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section text-center mb-48">
              <h2 className="title split-text effect-right">
                <SplitTextAnimation text="Clients Testimonials" />
              </h2>
              <p className="text-1 split-text split-lines-transform">
                Thousands of luxury home enthusiasts just like you visit our
                website.
              </p>
            </div>
            <div className={styles.carouselWrap}>
              <Swiper
                modules={[Pagination, Autoplay]}
                className={`swiper style-pagination sw-layout ${styles.swiper}`}
                pagination={{ clickable: true }}
                preventClicks={false}
                preventClicksPropagation={false}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={items.length > 4}
                spaceBetween={20}
                slidesPerView={1}
                slidesPerGroup={1}
                breakpoints={{
                  768: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 20 },
                  992: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
                  1200: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 24 },
                }}
              >
                {items.map((item) => (
                  <SwiperSlide key={item._id || item.id}>
                    {item.video ? (
                      <VideoTestimonialCard item={item} />
                    ) : (
                      <TextTestimonialCard item={item} />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import FilterTop from "@/components/properties/FilterTop";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

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

export default function Hero({
  heroSlides = [],
  propertyTypes = [],
  heroStats = [],
  heroBadgeImage = "",
}) {
  const heroHeight = "clamp(560px, 94vh, 860px)";
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const videoSlide = (heroSlides || []).find(
    (s) => typeof s?.backgroundVideo === "string" && s.backgroundVideo.trim()
  );
  const hasHeroVideo = !!videoSlide;
  const validSlides = (heroSlides || []).filter((s) => s?.backgroundImage);
  const defaultSlide = {
    title: "Search Luxury Homes",
    subtitle:
      "Thousands of luxury home enthusiasts just like you visit our website.",
    backgroundImage: "/images/slider/slider-1.jpg",
    ctaLink: "/properties",
  };
  const slides = validSlides.length ? validSlides : [defaultSlide];
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const propertyTypeButtons = Array.isArray(propertyTypes)
    ? propertyTypes.filter((item) => item?.slug && Number(item?.count || 0) > 0)
    : [];
  const statsCards = Array.isArray(heroStats)
    ? heroStats.filter((item) => item?.label && Number(item?.value || 0) > 0)
    : [];
  const currentSlide = hasHeroVideo
    ? videoSlide
    : slides[activeSlideIdx] || slides[0] || defaultSlide;
  const hasAdminSlides = Array.isArray(heroSlides) && heroSlides.length > 0;
  const heroTitle = String(
    currentSlide?.title ?? (hasAdminSlides ? "" : defaultSlide.title)
  ).trim();
  const heroSubtitle = String(
    currentSlide?.subtitle ??
      (hasAdminSlides
        ? ""
        : "Thousands of luxury home enthusiasts just like you visit our website.")
  ).trim();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    router.push(`/properties?q=${encodeURIComponent(q)}`);
  };

  return (
    <div
      className={`page-title home01${hasHeroVideo ? " hero-video-mode" : ""}`}
      style={{
        position: "relative",
        overflow: filterPanelOpen ? "visible" : "hidden",
        height: heroHeight,
      }}
    >
      {hasHeroVideo ? (
        <video
          key={videoSlide._id || videoSlide.backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={videoSlide.backgroundImage || undefined}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src={videoSlide.backgroundVideo} />
        </video>
      ) : (
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          loop={slides.length > 1}
          onSlideChange={(swiper) => setActiveSlideIdx(swiper.realIndex || 0)}
          className="hero-bg-swiper"
          style={{ position: "absolute", inset: 0, zIndex: 0, height: "100%" }}
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={slide._id || idx}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${slide.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 100%)",
          zIndex: 1,
        }}
      />
      {heroBadgeImage ? (
        <div className="hero-side-badge">
          <img src={heroBadgeImage} alt="Hero badge" />
        </div>
      ) : null}
      <div className="tf-container" style={{ height: "100%" }}>
        <div
          className="row justify-center relative"
          style={{
            zIndex: 2,
            height: "100%",
            alignItems: "center",
            paddingBottom: 0,
          }}
        >
          <div className="col-lg-8">
            <div className="content-inner">
              {heroTitle || heroSubtitle ? (
                <div className="heading-title">
                  {heroTitle ? <h1 className="title">{heroTitle}</h1> : null}
                  {heroSubtitle ? <p className="h6 fw-4">{heroSubtitle}</p> : null}
                </div>
              ) : null}
              <div className="hero-filter-breakout">
                <div className="wg-filter wg-filter--hero">
                  <div className="form-title">
                    <form onSubmit={handleSearch}>
                      <fieldset>
                        <input
                          type="text"
                          placeholder="Place, neighborhood, school or agent..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                      </fieldset>
                    </form>
                    <div className="box-item wrap-btn">
                      <div
                        className="btn-filter show-form"
                        role="button"
                        tabIndex={0}
                        onClick={() => setFilterPanelOpen((o) => !o)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setFilterPanelOpen((o) => !o);
                          }
                        }}
                        style={{
                          background: filterPanelOpen
                            ? "var(--Sub-primary-2)"
                            : undefined,
                        }}
                      >
                        <div className="icons">
                          <svg
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 4H14"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 4H3"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 12H12"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 12H3"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 20H16"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 20H3"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 2V6"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 10V14"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M16 18V22"
                              stroke="var(--color-primary, #F1913D)"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="tf-btn bg-color-primary pd-3"
                      >
                        Search <i className="icon-MagnifyingGlass fw-6" />
                      </button>
                    </div>
                  </div>
                  {propertyTypeButtons.length > 0 ? (
                    <div className="hero-type-buttons">
                      {propertyTypeButtons.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/properties?type=${encodeURIComponent(item.slug)}`}
                          className="hero-filter-chip"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {statsCards.length > 0 ? (
                    <div className="hero-stats-grid">
                      {statsCards.map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="hero-stat-card">
                          <h4 className="hero-stat-card__value">
                            <AnimatedCount value={item.value} />
                            {item.suffix || ""}
                          </h4>
                          <p className="hero-stat-card__label">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <FilterTop
                    variant="hero"
                    panelOpen={filterPanelOpen}
                    onPanelOpenChange={setFilterPanelOpen}
                    heroKeyword={keyword}
                    onHeroClearKeyword={() => setKeyword("")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

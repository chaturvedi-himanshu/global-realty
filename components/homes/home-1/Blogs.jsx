"use client";
import { blogPosts as FALLBACK_BLOGS } from "@/data/blogs";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { EffectFade, Navigation } from "swiper/modules";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import styles from "./BlogsHeroSlider.module.css";
import "swiper/css/effect-fade";

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function Blogs({
  blogs: dbBlogs = [],
  showHeading = true,
  topPadding,
}) {
  const posts = dbBlogs.length > 0 ? dbBlogs : FALLBACK_BLOGS;
  const [activeSlide, setActiveSlide] = React.useState(1);

  const normalizedPosts = posts.map((p) => ({
    id: p._id || p.id,
    slug: p.slug || p._id || p.id,
    title: p.title,
    imgSrc: p.featuredImage || p.imgSrc || "/images/listings/house-1.jpg",
    tag: p.category?.name || p.category?.title || p.category || p.tag || "Real Estate",
    date: formatDate(p.publishedAt || p.createdAt) || p.date || "",
  }));
  const totalSlides = Math.max(1, normalizedPosts.length);
  const progressPercent = Math.min(100, (activeSlide / totalSlides) * 100);

  return (
    <section
      className={styles.section}
      style={
        typeof topPadding === "number"
          ? { paddingTop: `${topPadding}px` }
          : undefined
      }
    >
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            {showHeading ? (
              <div className="heading-section text-center mb-48">
                <h2 className="title split-text effect-right">
                  <SplitTextAnimation text="REAL ESTATE NEWS & UPDATES" />
                </h2>
                <p className="text-1 split-text split-lines-transform">
                  Stay updated with the latest trends, insights, and
                  opportunities in the real estate.
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.sliderShell}>
          <Swiper
            dir="ltr"
            modules={[Navigation, EffectFade]}
            slidesPerView={1}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={650}
            navigation={{
              nextEl: ".blog-hero-next",
              prevEl: ".blog-hero-prev",
            }}
            onSlideChange={(swiper) => {
              const next = (swiper?.realIndex ?? 0) + 1;
              setActiveSlide(next);
            }}
            onInit={(swiper) => {
              const initial = (swiper?.realIndex ?? 0) + 1;
              setActiveSlide(initial);
            }}
          >
            {normalizedPosts.map((post, index) => (
              <SwiperSlide className="swiper-slide" key={post.id || index}>
                <article className={styles.slideCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imgSrc}
                    alt={post.title}
                    className={styles.bg}
                  />
                  <div className={styles.overlay} />
                  <div className={styles.content}>
                    <p className={styles.meta}>
                      {post.date ? `${post.date} | ` : ""}
                      {post.tag}
                    </p>
                    <h2 className={styles.title}>{post.title}</h2>
                    <Link
                      href={`/blog-details/${post.slug}`}
                      className={styles.btn}
                    >
                      Read More
                    </Link>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={styles.controls}>
            <div className={styles.progressWrap}>
              <div className={styles.fraction}>
                <span className={styles.current}>
                  {String(activeSlide).padStart(2, "0")}
                </span>
                <span className={styles.separator}> / </span>
                <span>{String(totalSlides).padStart(2, "0")}</span>
              </div>
              <div className={styles.progressTrack}>
                <span
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className={styles.navWrap}>
              <button
                type="button"
                className={`${styles.navBtn} blog-hero-prev`}
                aria-label="Previous slide"
                onClick={(e) => e.preventDefault()}
              >
                <span className={styles.navIcon}>&#8249;</span>
              </button>
              <button
                type="button"
                className={`${styles.navBtn} blog-hero-next`}
                aria-label="Next slide"
                onClick={(e) => e.preventDefault()}
              >
                <span className={styles.navIcon}>&#8250;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

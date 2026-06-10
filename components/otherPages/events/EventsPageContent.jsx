"use client";

import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";

const HEADING = "Discover our events";
const SUB =
  "Photos and highlights from expos, launches, and community moments with Global Realty.";
const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80";

function getYoutubeEmbedUrl(url) {
  const u = String(url || "").trim();
  if (!u) return null;
  if (u.includes("youtube.com/embed/")) return u.split("?")[0];
  const m = u.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|watch\?.+&v=))([^&?/]+)/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const DEFAULT_LIGHTBOX_DIMS = { w: 1600, h: 1067 };

function EventMediaCard({ item, style, caption, dims }) {
  const { kind, url } = item;
  const yt = kind === "video" ? getYoutubeEmbedUrl(url) : null;

  return (
    <div className="events-media-card events-gallery__cell" style={style}>
      <div className="events-media-card__shine" aria-hidden />
      <div className="events-media-card__inner">
        {kind === "video" && yt ? (
          <div className="events-media-card__frame">
            <iframe
              title="Event video"
              src={yt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : kind === "video" ? (
          <div className="events-media-card__frame">
            <video src={url} controls playsInline className="events-media-card__video" />
          </div>
        ) : (
          <Item
            original={url}
            thumbnail={url}
            caption={caption}
            width={dims?.w || DEFAULT_LIGHTBOX_DIMS.w}
            height={dims?.h || DEFAULT_LIGHTBOX_DIMS.h}
          >
            {({ ref, open }) => (
              <a
                onClick={open}
                className="events-media-card__frame events-media-card__frame--image"
                role="button"
                tabIndex={0}
                aria-label={caption || "View event photo"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open(e);
                  }
                }}
              >
                <Image
                  ref={ref}
                  src={url}
                  alt={caption || ""}
                  fill
                  className="events-media-card__img"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </a>
            )}
          </Item>
        )}
      </div>
    </div>
  );
}

export default function EventsPageContent({ events = [], bannerConfig = {} }) {
  const list = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(
      (e) =>
        e &&
        e.isActive !== false &&
        Array.isArray(e.items) &&
        e.items.some((it) => String(it?.url || "").trim()),
    );
  }, [events]);

  const [activeIndex, setActiveIndex] = useState(0);
  const displayIndex = Math.min(
    activeIndex,
    Math.max(0, list.length - 1),
  );
  const activeTab = list[displayIndex] || list[0];
  const bannerHeading = String(bannerConfig?.heading || "").trim() || HEADING;
  const bannerSubheading = String(bannerConfig?.subheading || "").trim() || SUB;
  const bannerImage =
    String(bannerConfig?.bannerImage || "").trim() || DEFAULT_BANNER_IMAGE;
  const sortedItems = useMemo(() => {
    if (!activeTab?.items) return [];
    return [...activeTab.items]
      .filter((it) => String(it?.url || "").trim())
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [activeTab]);

  // Preload natural dimensions so the PhotoSwipe lightbox sizes images correctly.
  const [imageDims, setImageDims] = useState({});
  useEffect(() => {
    let cancelled = false;
    sortedItems.forEach((it) => {
      if (it?.kind === "video") return;
      const url = String(it?.url || "").trim();
      if (!url) return;
      const probe = new window.Image();
      probe.onload = () => {
        if (cancelled || !probe.naturalWidth || !probe.naturalHeight) return;
        setImageDims((prev) =>
          prev[url]
            ? prev
            : { ...prev, [url]: { w: probe.naturalWidth, h: probe.naturalHeight } },
        );
      };
      probe.src = url;
    });
    return () => {
      cancelled = true;
    };
  }, [sortedItems]);

  if (!list.length) {
    return (
      <section className="section-help style-1 events-page-section">
        <div className="events-page-section__glow" aria-hidden />
        <div className="tf-container">
          <header
            className="events-banner-hero events-banner-hero--fullbleed"
            style={{ backgroundImage: `url(${bannerImage})` }}
          >
            <div className="events-banner-hero__overlay" />
            <div className="events-banner-hero__content">
              <p className="events-page-hero__eyebrow">Events gallery</p>
              <h1 className="title split-text effect-right events-page-hero__title">
                <SplitTextAnimation text={bannerHeading} />
              </h1>
              <p className="text-1 split-text split-lines-transform events-page-hero__sub">
                {bannerSubheading}
              </p>
            </div>
          </header>
          <p className="events-page-empty text-1 text-center">
            New events will appear here soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-help style-1 events-page-section">
      <div className="events-page-section__glow" aria-hidden />
      <div className="tf-container">
        <header
          className="events-banner-hero events-banner-hero--fullbleed"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <div className="events-banner-hero__overlay" />
          <div className="events-banner-hero__content">
            <p className="events-page-hero__eyebrow">Events gallery</p>
            <h1 className="title split-text effect-right events-page-hero__title">
              <SplitTextAnimation text={bannerHeading} />
            </h1>
            <p className="text-1 split-text split-lines-transform events-page-hero__sub">
              {bannerSubheading}
            </p>
          </div>
        </header>

        <div
          className="events-tabs"
          role="tablist"
          aria-label="Event categories"
        >
          <div className="events-tabs__track">
            {list.map((item, index) => {
              const tabId = `events-tab-${index}`;
              return (
                <button
                  key={String(item._id || item.slug || index)}
                  type="button"
                  id={tabId}
                  role="tab"
                  aria-selected={displayIndex === index}
                  className={`events-tabs__pill ${displayIndex === index ? "is-active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className="events-tabs__pill-text">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="events-gallery__meta">
          <h2 className="events-gallery__meta-title">{activeTab?.name}</h2>
          <p className="events-gallery__meta-count">
            {sortedItems.length} {sortedItems.length === 1 ? "media item" : "media items"}
          </p>
        </div>

        <Gallery
          options={{
            arrowPrev: true,
            arrowNext: true,
            arrowKeys: true,
            counter: true,
            loop: true,
          }}
        >
          <div
            key={displayIndex}
            className="events-gallery"
            role="tabpanel"
            aria-labelledby={`events-tab-${displayIndex}`}
          >
            {sortedItems.map((item, i) => (
              <EventMediaCard
                key={`${activeTab._id}-${i}-${item.url}`}
                item={item}
                caption={activeTab?.name}
                dims={imageDims[String(item?.url || "").trim()]}
                style={{
                  animationDelay: `${Math.min(i, 8) * 55}ms`,
                }}
              />
            ))}
          </div>
        </Gallery>
      </div>
    </section>
  );
}

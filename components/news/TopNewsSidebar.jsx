"use client";
import React from "react";
import Image from "next/image";
import useSWR from "@/lib/swr-lite";
import SubscribeFollow from "./SubscribeFollow";

const TOP_NEWS_LIMIT = 6;

function formatShortDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NewsThumbFallback() {
  return (
    <div className="top-news-widget__thumb-fallback" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

function TopNewsItem({ post }) {
  const href = String(post.url || "").trim();
  const hasUrl = href.length > 0;
  const dateText = formatShortDate(post.publishedDate || post.createdAt);
  const linkProps = hasUrl
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href: "#" };

  return (
    <li className="top-news-widget__item">
      <a
        {...linkProps}
        className="top-news-widget__thumb"
        aria-label={post.title}
        tabIndex={hasUrl ? 0 : -1}
      >
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title || "News"}
            width={80}
            height={64}
            style={{ objectFit: "cover", width: 80, height: 64 }}
            unoptimized
          />
        ) : (
          <NewsThumbFallback />
        )}
      </a>
      <div className="top-news-widget__content">
        {dateText ? (
          <p className="top-news-widget__date">{dateText}</p>
        ) : null}
        <h6 className="top-news-widget__title">
          <a {...linkProps}>{post.title}</a>
        </h6>
        {post.source ? (
          <span className="top-news-widget__source">{post.source}</span>
        ) : null}
      </div>
    </li>
  );
}

function TopNewsList() {
  const { data, isLoading } = useSWR(
    `/api/news?topNews=true&limit=${TOP_NEWS_LIMIT}&status=published`,
  );
  const posts = (data?.data || []).slice(0, TOP_NEWS_LIMIT);

  if (isLoading) {
    return (
      <ul className="top-news-widget__list" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="top-news-widget__item top-news-widget__item--skeleton"
          >
            <div className="top-news-widget__thumb top-news-widget__thumb--skeleton" />
            <div className="top-news-widget__content">
              <div className="top-news-widget__bar" style={{ width: "40%" }} />
              <div className="top-news-widget__bar top-news-widget__bar--lg" />
              <div
                className="top-news-widget__bar top-news-widget__bar--lg"
                style={{ width: "70%" }}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="top-news-widget__empty">No top news yet.</p>
    );
  }

  return (
    <ul className="top-news-widget__list">
      {posts.map((post) => (
        <TopNewsItem key={post._id} post={post} />
      ))}
    </ul>
  );
}

export default function TopNewsSidebar() {
  return (
    <aside className="news-sidebar" aria-label="Top news sidebar">
      <div className="news-widget top-news-widget">
        <h5 className="news-widget__title">Top News</h5>
        <TopNewsList />
      </div>
      <SubscribeFollow />
    </aside>
  );
}

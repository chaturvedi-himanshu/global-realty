"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import useSWR from "@/lib/swr-lite";
import TopNewsSidebar from "./TopNewsSidebar";

function NewsSkeleton() {
  return (
    <div className="blog-article-item style-2 lst-blog-skeleton">
      <div className="image-wrap lst-blog-skeleton__img" />
      <div
        className="article-content"
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div className="lst-blog-skeleton__bar" style={{ width: "33%" }} />
        <div className="lst-blog-skeleton__bar lst-blog-skeleton__bar--md" />
        <div
          className="lst-blog-skeleton__bar lst-blog-skeleton__bar--md"
          style={{ width: "80%" }}
        />
        <div className="lst-blog-skeleton__bar" style={{ width: "25%" }} />
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsList() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const { data, isLoading } = useSWR(
    `/api/news?page=${page}&limit=${limit}&status=published`,
  );

  const items = data?.data || [];
  const pagination = data?.pagination;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <section className="section-blog-grid section-news-grid section-news-grid--with-sidebar">
      <div className="tf-container">
        <div className="row" style={{ rowGap: "32px" }}>
          <div className="col-lg-8">
            <div style={{ marginBottom: "28px" }}>
              <div
                className="box-title"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <h2 style={{ margin: 0 }}>Latest News</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="news-grid-2col">
                {[...Array(4)].map((_, i) => (
                  <NewsSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="lst-empty">
                <div className="lst-empty__icon">📰</div>
                <h3 className="lst-empty__title">No news yet</h3>
                <p className="lst-empty__text">
                  Please check back soon for the latest real estate updates.
                </p>
              </div>
            ) : (
              <div className="news-grid-2col">
                {items.map((post) => {
                  const href = String(post.url || "").trim();
                  const hasUrl = href.length > 0;
                  return (
                    <article
                      key={post._id}
                      className="blog-article-item style-2 news-card"
                    >
                      <a
                        href={hasUrl ? href : "#"}
                        target={hasUrl ? "_blank" : undefined}
                        rel={hasUrl ? "noopener noreferrer" : undefined}
                        className="news-card__image-link"
                        aria-label={post.title}
                      >
                        <div className="image-wrap news-card__image">
                          {post.image ? (
                            <Image
                              className="lazyload"
                              alt={post.title || "News"}
                              width={800}
                              height={500}
                              src={post.image}
                              style={{
                                objectFit: "cover",
                                height: "100%",
                                width: "100%",
                              }}
                              unoptimized
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                background: "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                style={{
                                  width: "2.5rem",
                                  height: "2.5rem",
                                  color: "#9ca3af",
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          {post.source ? (
                            <div className="box-tag">
                              <div className="tag-item text-4 text_white fw-6">
                                {post.source}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </a>
                      <div className="article-content">
                        <div className="time">
                          <div className="icons">
                            <svg
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="9"
                                cy="9"
                                r="8"
                                stroke="#5C5E61"
                                strokeWidth="1"
                                fill="none"
                              />
                              <path
                                d="M9 5v4l2.5 2.5"
                                stroke="#5C5E61"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="fw-5">
                            {formatDate(post.publishedDate || post.createdAt)}
                          </p>
                        </div>
                        <h4 className="title line-clamp-3">
                          <a
                            href={hasUrl ? href : "#"}
                            target={hasUrl ? "_blank" : undefined}
                            rel={hasUrl ? "noopener noreferrer" : undefined}
                          >
                            {post.title}
                          </a>
                        </h4>
                        {post.description ? (
                          <p className="news-card__desc">{post.description}</p>
                        ) : null}
                        {hasUrl ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tf-btn-link"
                          >
                            <span>Read More</span>
                            <svg
                              width={20}
                              height={20}
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 18.333a8.333 8.333 0 100-16.666 8.333 8.333 0 000 16.666z"
                                stroke="var(--color-primary, #F1913D)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6.667 10h6.666M10 13.333L13.333 10 10 6.667"
                                stroke="var(--color-primary, #F1913D)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <ul
                className="wg-pagination justify-center"
                style={{
                  marginTop: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <li className="arrow">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: "#374151",
                      display: "grid",
                      placeItems: "center",
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                      opacity: page <= 1 ? 0.45 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="icon-arrow-left" />
                  </button>
                </li>
                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    Math.abs(pageNum - page) <= 1
                  ) {
                    return (
                      <li key={pageNum}>
                        <button
                          onClick={() => setPage(pageNum)}
                          aria-label={`Page ${pageNum}`}
                          aria-current={page === pageNum ? "page" : undefined}
                          style={{
                            minWidth: "42px",
                            height: "42px",
                            padding: "0 12px",
                            borderRadius: "999px",
                            border:
                              page === pageNum
                                ? "1px solid var(--color-primary, #F1913D)"
                                : "1px solid #e5e7eb",
                            background:
                              page === pageNum
                                ? "var(--color-primary, #F1913D)"
                                : "#fff",
                            color: page === pageNum ? "#fff" : "#374151",
                            fontWeight: page === pageNum ? 700 : 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                  if (Math.abs(pageNum - page) === 2) {
                    return (
                      <li key={pageNum}>
                        <span
                          style={{
                            minWidth: "30px",
                            display: "inline-block",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontWeight: 700,
                          }}
                        >
                          ...
                        </span>
                      </li>
                    );
                  }
                  return null;
                })}
                <li className="arrow">
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    aria-label="Next page"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: "#374151",
                      display: "grid",
                      placeItems: "center",
                      cursor:
                        page >= pagination.pages ? "not-allowed" : "pointer",
                      opacity: page >= pagination.pages ? 0.45 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="icon-arrow-right" />
                  </button>
                </li>
              </ul>
            )}
          </div>

          <div className="col-lg-4">
            <div
              style={{ marginBottom: "28px", visibility: "hidden" }}
              aria-hidden="true"
            >
              <div
                className="box-title"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <h2 style={{ margin: 0 }}>&nbsp;</h2>
              </div>
            </div>
            <TopNewsSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}

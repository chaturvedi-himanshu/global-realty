"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "@/lib/swr-lite";
import { useRouter, useSearchParams } from "next/navigation";


function BlogSkeleton() {
  return (
    <div className="blog-article-item style-2 lst-blog-skeleton">
      <div className="image-wrap lst-blog-skeleton__img" />
      <div className="article-content" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div className="lst-blog-skeleton__bar" style={{ width: "33%" }} />
        <div className="lst-blog-skeleton__bar lst-blog-skeleton__bar--md" />
        <div className="lst-blog-skeleton__bar lst-blog-skeleton__bar--md" style={{ width: "80%" }} />
        <div className="lst-blog-skeleton__bar" style={{ width: "25%" }} />
      </div>
    </div>
  );
}

export default function Blogs2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 9;
  const query = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const selectedCategory = searchParams.get("category") || "";

  const { data: categoriesData } = useSWR("/blog-categories");
  const { data, isLoading } = useSWR(
    `/blogs?page=${page}&limit=${limit}&status=published${selectedCategory ? `&category=${selectedCategory}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`);

  const posts = data?.data || [];
  const pagination = data?.pagination;
  const categories = categoriesData?.data || [];

  const handleCategoryChange = (catSlug) => {
    const next = new URLSearchParams(searchParams.toString());
    if (catSlug) next.set("category", catSlug);
    else next.delete("category");
    const nextQuery = next.toString();
    router.push(nextQuery ? `/blogs?${nextQuery}` : "/blogs");
    setPage(1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, selectedCategory]);

  return (
    <section className="section-blog-grid">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
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
                <h2 style={{ margin: 0 }}>Blogs</h2>
                {(query || tag) && (
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#6b7280", fontWeight: 500 }}>
                    {query ? `Search: "${query}"` : `Tag: "${tag}"`}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`lst-cat-pill${!selectedCategory ? " lst-cat-pill--active" : ""}`}
                    style={{
                      borderRadius: "999px",
                      padding: "7px 14px",
                      border: !selectedCategory
                        ? "1px solid var(--color-primary, #F1913D)"
                        : "1px solid #e5e7eb",
                      background: !selectedCategory
                        ? "var(--color-primary, #F1913D)"
                        : "#ffffff",
                      color: !selectedCategory ? "#fff" : "#374151",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      letterSpacing: "0.01em",
                      boxShadow: !selectedCategory
                        ? "0 8px 20px rgba(0,0,0,.12)"
                        : "none",
                      transition: "all .2s ease",
                    }}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`lst-cat-pill${selectedCategory === cat.slug ? " lst-cat-pill--active" : ""}`}
                      style={{
                        borderRadius: "999px",
                        padding: "7px 14px",
                        border:
                          selectedCategory === cat.slug
                            ? "1px solid var(--color-primary, #F1913D)"
                            : "1px solid #e5e7eb",
                        background:
                          selectedCategory === cat.slug
                            ? "var(--color-primary, #F1913D)"
                            : "#fff",
                        color:
                          selectedCategory === cat.slug ? "#fff" : "#374151",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        letterSpacing: "0.01em",
                        boxShadow:
                          selectedCategory === cat.slug
                            ? "0 8px 20px rgba(0,0,0,.12)"
                            : "none",
                        transition: "all .2s ease",
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid-layout-3">
                {[...Array(6)].map((_, i) => (
                  <BlogSkeleton key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="lst-empty">
                <div className="lst-empty__icon">📝</div>
                <h3 className="lst-empty__title">No blogs found</h3>
                <p className="lst-empty__text">
                  {selectedCategory
                    ? "Try selecting a different category."
                    : "No published blogs yet."}
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange("")}
                    className="lst-empty__btn"
                  >
                    View All Blogs
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-layout-3">
                {posts.map((post) => (
                  <div key={post._id} className="blog-article-item style-2">
                    <div
                      className="image-wrap"
                      style={{ height: "220px", overflow: "hidden" }}
                    >
                      {post.featuredImage ? (
                        <Image
                          className="lazyload"
                          alt={post.title}
                          width={600}
                          height={396}
                          src={post.featuredImage}
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
                      {post.category?.name && (
                        <div className="box-tag">
                          <div className="tag-item text-4 text_white fw-6">
                            {post.category.name}
                          </div>
                        </div>
                      )}
                    </div>
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
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : new Date(post.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                        </p>
                      </div>
                      <h4 className="title line-clamp-3">
                        <Link href={`/blog-details/${post.slug || post._id}`}>
                          {post.title}
                        </Link>
                      </h4>
                      {post.excerpt && (
                        <p
                          className="lst-blog-excerpt"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {post.excerpt}
                        </p>
                      )}
                      <Link
                        href={`/blog-details/${post.slug || post._id}`}
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
                      </Link>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
    </section>
  );
}

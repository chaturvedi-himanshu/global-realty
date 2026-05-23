"use client";
import React, { useState, useEffect, useCallback } from "react";
import LayoutHandler from "./LayoutHandler";
import DropdownSelect from "../common/DropdownSelect";
import PropertyGridItems from "./PropertyGridItems";
import PropertyListItems from "./PropertyListItems";
import api from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";

const SORT_LABEL_MAP = {
  Newest: "newest",
  Oldest: "oldest",
  "Price: Low to High": "price_asc",
  "Price: High to Low": "price_desc",
};
const SORT_API_MAP = {
  newest: "createdAt_desc",
  oldest: "createdAt_asc",
  price_asc: "price_asc",
  price_desc: "price_desc",
};

export default function Properties2({ defaultGrid = true }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);

  // All filter values — including sort — come from URL so they survive navigation
  const search = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const type = searchParams.get("type") || "";
  const propertySubType = searchParams.get("propertySubType") || "";
  const status = searchParams.get("status") || "";
  const beds = searchParams.get("beds") || "";
  const baths = searchParams.get("baths") || "";
  const listingType = searchParams.get("listingType") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const possessionStatus = searchParams.get("possessionStatus") || "";
  const amenities = searchParams.get("amenities") || "";
  const minArea = searchParams.get("minArea") || "";
  const maxArea = searchParams.get("maxArea") || "";
  const sortBy = searchParams.get("sort") || ""; // "newest" | "oldest" | "price_asc" | "price_desc"

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.set("keyword", search);
      if (city) params.set("city", city);
      if (type) params.set("propertyType", type);
      if (propertySubType) params.set("propertySubType", propertySubType);
      if (status) params.set("status", status);
      if (beds) params.set("bedrooms", beds);
      if (baths) params.set("bathrooms", baths);
      if (listingType) params.set("listingType", listingType);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (possessionStatus) params.set("possessionStatus", possessionStatus);
      if (amenities) params.set("amenities", amenities);
      if (minArea) params.set("minArea", minArea);
      if (maxArea) params.set("maxArea", maxArea);
      if (SORT_API_MAP[sortBy]) params.set("sort", SORT_API_MAP[sortBy]);

      const res = await api.get(`/properties?${params.toString()}`);
      const data = res.data;
      setProperties(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    city,
    type,
    propertySubType,
    status,
    beds,
    baths,
    listingType,
    minPrice,
    maxPrice,
    possessionStatus,
    amenities,
    minArea,
    maxArea,
    sortBy,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    city,
    type,
    propertySubType,
    status,
    beds,
    baths,
    listingType,
    minPrice,
    maxPrice,
    possessionStatus,
    amenities,
    minArea,
    maxArea,
    sortBy,
  ]);

  const sortOptions = [
    "Sort by (Default)",
    "Newest",
    "Oldest",
    "Price: Low to High",
    "Price: High to Low",
  ];

  // Derive the label to show in the dropdown from the current URL sort value
  const currentSortLabel =
    Object.entries(SORT_LABEL_MAP).find(([, v]) => v === sortBy)?.[0] ||
    "Sort by (Default)";

  const handleSort = (option) => {
    const next = new URLSearchParams(searchParams.toString());
    const sortKey = SORT_LABEL_MAP[option];
    sortKey ? next.set("sort", sortKey) : next.delete("sort");
    next.delete("page"); // reset pagination on sort change
    router.push(`/properties?${next.toString()}`);
  };

  const start = properties.length === 0 ? 0 : (page - 1) * 9 + 1;
  const end = (page - 1) * 9 + properties.length;

  return (
    <section className="section-property-layout">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="box-title">
              <h2>Projects</h2>
              <div className="right">
                <ul className="nav-tab-filter group-layout" role="tablist">
                  <LayoutHandler defaultGrid={defaultGrid} />
                </ul>
                <DropdownSelect
                  addtionalParentClass="select-filter list-sort"
                  options={sortOptions}
                  selectedValue={currentSortLabel}
                  onChange={handleSort}
                />
              </div>
            </div>

            {loading ? (
              <div
                className="tf-grid-layout lg-col-3 md-col-2"
                style={{ minHeight: 300 }}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="box-house"
                    style={{
                      background: "#f3f4f6",
                      borderRadius: 12,
                      height: 320,
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div
                className="lst-empty"
                style={{ padding: "4rem 0", textAlign: "center" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
                <h3>No projects found</h3>
                <p style={{ color: "#6b7280" }}>
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="flat-animate-tab">
                <div className="tab-content">
                  <div
                    className={`tab-pane${defaultGrid ? " active show" : ""}`}
                    id="gridLayout"
                    role="tabpanel"
                  >
                    <div className="tf-grid-layout lg-col-3 md-col-2">
                      <PropertyGridItems properties={properties} />
                    </div>
                  </div>
                  <div
                    className={`tab-pane${!defaultGrid ? " active show" : ""}`}
                    id="listLayout"
                    role="tabpanel"
                  >
                    <div className="tf-grid-layout lg-col-1">
                      <PropertyListItems properties={properties} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pagination.total > 0 && (
              <div style={{ marginTop: 40 }}>
                <p
                  className="text-1"
                  style={{
                    textAlign: "center",
                    marginBottom: 16,
                    color: "#6b7280",
                  }}
                >
                  Showing {start}–{end} of {pagination.total} Properties
                </p>
                <ul
                  className="wg-pagination justify-center"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <li className="arrow">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 999,
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
                    const p = i + 1;
                    if (
                      p === 1 ||
                      p === pagination.pages ||
                      Math.abs(p - page) <= 1
                    ) {
                      return (
                        <li key={p}>
                          <button
                            onClick={() => setPage(p)}
                            aria-label={`Page ${p}`}
                            aria-current={page === p ? "page" : undefined}
                            style={{
                              minWidth: 42,
                              height: 42,
                              padding: "0 12px",
                              borderRadius: 999,
                              border:
                                page === p
                                  ? "1px solid var(--color-primary, #F1913D)"
                                  : "1px solid #e5e7eb",
                              background:
                                page === p
                                  ? "var(--color-primary, #F1913D)"
                                  : "#fff",
                              color: page === p ? "#fff" : "#374151",
                              fontWeight: page === p ? 700 : 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {p}
                          </button>
                        </li>
                      );
                    }
                    if (Math.abs(p - page) === 2) {
                      return (
                        <li key={p}>
                          <span
                            style={{
                              minWidth: 30,
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
                        width: 42,
                        height: 42,
                        borderRadius: 999,
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DropdownSelect from "../common/DropdownSelect";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";
import Slider from "rc-slider";

const fetcher = (url) => api.get(url).then((r) => r.data);
const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const PRICE_MAX = 100000000; // 10 Cr
const AREA_MAX = 10000; // 10,000 sq ft

function fmt(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function FilterTop({
  variant = "page",
  panelOpen: panelOpenProp,
  onPanelOpenChange,
  heroKeyword = "",
  onHeroClearKeyword,
}) {
  const isHero = variant === "hero";
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelRef = useRef(null);

  /* ── URL-synced state ── */
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [baths, setBaths] = useState(searchParams.get("baths") || "");
  const [beds, setBeds] = useState(searchParams.get("beds") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [listingType, setListingType] = useState(
    searchParams.get("listingType") || "",
  );
  const [possessionStatus, setPossessionStatus] = useState(
    searchParams.get("possessionStatus") || "",
  );
  const [amenities, setAmenities] = useState(() => {
    const a = searchParams.get("amenities");
    return a ? a.split(",").filter(Boolean) : [];
  });
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || PRICE_MAX),
  ]);
  const [areaRange, setAreaRange] = useState([
    Number(searchParams.get("minArea") || 0),
    Number(searchParams.get("maxArea") || AREA_MAX),
  ]);
  const [pagePanelOpen, setPagePanelOpen] = useState(false);
  const panelOpen = isHero ? Boolean(panelOpenProp) : pagePanelOpen;
  const setPanelOpen = (next) => {
    if (isHero) onPanelOpenChange?.(next);
    else setPagePanelOpen(next);
  };

  /* ── Remote data ── */
  const { data: typesData } = useSWR("/property-types", fetcher);
  const { data: amenitiesData } = useSWR("/amenities", fetcher);
  const { data: citiesRes } = useSWR("/website/property-cities", fetcher);
  const propertyTypes = typesData?.data || [];
  const amenityList = amenitiesData?.data || [];
  const cityOptionsFromDb = Array.isArray(citiesRes?.data) ? citiesRes.data : [];

  /* ── Sync state when URL changes ── */
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setStatus(searchParams.get("status") || "");
    setType(searchParams.get("type") || "");
    setBaths(searchParams.get("baths") || "");
    setBeds(searchParams.get("beds") || "");
    setCity(searchParams.get("city") || "");
    setListingType(searchParams.get("listingType") || "");
    setPossessionStatus(searchParams.get("possessionStatus") || "");
    const a = searchParams.get("amenities");
    setAmenities(a ? a.split(",").filter(Boolean) : []);
    setPriceRange([
      Number(searchParams.get("minPrice") || 0),
      Number(searchParams.get("maxPrice") || PRICE_MAX),
    ]);
    setAreaRange([
      Number(searchParams.get("minArea") || 0),
      Number(searchParams.get("maxArea") || AREA_MAX),
    ]);
  }, [searchParams]);

  const typeLabel = useMemo(() => {
    if (!type) return "Type";
    const t = propertyTypes.find((p) => p._id === type || p.slug === type);
    return t?.name || "Type";
  }, [propertyTypes, type]);

  /* ── Apply filters to URL ── */
  const applyFilters = () => {
    const params = new URLSearchParams();
    const effectiveQ = (q || "").trim() || (isHero ? String(heroKeyword || "").trim() : "");
    if (effectiveQ) params.set("q", effectiveQ);
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    if (city) params.set("city", city);
    if (listingType) params.set("listingType", listingType);
    if (possessionStatus) params.set("possessionStatus", possessionStatus);
    if (amenities.length) params.set("amenities", amenities.join(","));
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0]);
    if (priceRange[1] < PRICE_MAX) params.set("maxPrice", priceRange[1]);
    if (areaRange[0] > 0) params.set("minArea", areaRange[0]);
    if (areaRange[1] < AREA_MAX) params.set("maxArea", areaRange[1]);
    const qs = params.toString();
    if (isHero && !qs) {
      onPanelOpenChange?.(false);
      return;
    }
    router.push(`/properties${qs ? `?${qs}` : ""}`);
    if (isHero) onPanelOpenChange?.(false);
  };

  const handleSearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
    applyFilters();
  };

  const clearAll = () => {
    setQ("");
    setStatus("");
    setType("");
    setBaths("");
    setBeds("");
    setCity("");
    setListingType("");
    setPossessionStatus("");
    setAmenities([]);
    setPriceRange([0, PRICE_MAX]);
    setAreaRange([0, AREA_MAX]);
    setPanelOpen(false);
    if (isHero) {
      onHeroClearKeyword?.();
      return;
    }
    router.push("/properties");
  };

  const removeFilter = (key, value) => {
    if (isHero) {
      if (key === "amenities" && value)
        setAmenities((prev) => prev.filter((a) => a !== value));
      else if (key === "q") setQ("");
      else if (key === "status") setStatus("");
      else if (key === "type") setType("");
      else if (key === "beds") setBeds("");
      else if (key === "baths") setBaths("");
      else if (key === "city") setCity("");
      else if (key === "listingType") setListingType("");
      else if (key === "possessionStatus") setPossessionStatus("");
      else if (key === "price") setPriceRange([0, PRICE_MAX]);
      else if (key === "area") setAreaRange([0, AREA_MAX]);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (key === "amenities") {
      const next = amenities.filter((a) => a !== value);
      next.length
        ? params.set("amenities", next.join(","))
        : params.delete("amenities");
    } else {
      params.delete(key);
    }
    router.push(`/properties?${params.toString()}`);
  };

  /* ── Build active filter chips ── */
  const activeFilters = useMemo(() => {
    const chips = [];
    if (q) chips.push({ key: "q", label: `Search: "${q}"` });
    if (status) chips.push({ key: "status", label: `Status: ${status}` });
    if (type) chips.push({ key: "type", label: `Type: ${typeLabel}` });
    if (beds) chips.push({ key: "beds", label: `Beds: ${beds}+` });
    if (baths) chips.push({ key: "baths", label: `Baths: ${baths}+` });
    if (city) chips.push({ key: "city", label: `City: ${city}` });
    if (listingType)
      chips.push({ key: "listingType", label: `For: ${listingType}` });
    if (possessionStatus)
      chips.push({
        key: "possessionStatus",
        label: `Possession: ${possessionStatus}`,
      });
    if (priceRange[0] > 0 || priceRange[1] < PRICE_MAX)
      chips.push({
        key: "price",
        label: `Price: ${fmt(priceRange[0])} – ${fmt(priceRange[1])}`,
      });
    if (areaRange[0] > 0 || areaRange[1] < AREA_MAX)
      chips.push({
        key: "area",
        label: `Area: ${areaRange[0]}–${areaRange[1]} sqft`,
      });
    amenities.forEach((slug) => {
      const a = amenityList.find((x) => toSlug(x.name) === slug);
      chips.push({ key: "amenities", value: slug, label: a?.name || slug });
    });
    return chips;
  }, [
    q,
    status,
    type,
    typeLabel,
    beds,
    baths,
    city,
    listingType,
    possessionStatus,
    priceRange,
    areaRange,
    amenities,
    amenityList,
  ]);

  const toggleAmenity = (amenity) => {
    const slug = toSlug(amenity.name);
    setAmenities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const chipRow =
    activeFilters.length > 0 ? (
      <div
        className={isHero ? "hero-filter-chips" : undefined}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "12px 0 4px",
        }}
      >
        {activeFilters.map((chip, i) => (
          <span
            key={i}
            className={isHero ? "hero-filter-chip" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              ...(isHero
                ? {}
                : {
                    background: "var(--Sub-primary-2)",
                    color: "var(--Primary)",
                    border: "1px solid var(--color-primary, #F1913D)",
                  }),
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {chip.label}
            <button
              type="button"
              onClick={() => removeFilter(chip.key, chip.value)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--Primary)",
                lineHeight: 1,
                padding: 0,
                fontSize: 15,
                fontWeight: 700,
              }}
              title={`Remove ${chip.label}`}
            >
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={clearAll}
          className={isHero ? "hero-filter-chips-clear" : undefined}
          style={{
            background: isHero ? "#fff" : "none",
            border: "1px solid #d1d5db",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 13,
            color: isHero ? "#374151" : "#6b7280",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Clear all
        </button>
      </div>
    ) : null;

  const advancedPanel = (
    <div
      ref={panelRef}
      className={`wd-search-form${panelOpen ? " show" : ""}`}
    >
      <div className="group-price">
        <div className="widget-price">
          <div className="box-title-price">
            <span className="title-price">Price range</span>
            <div className="caption-price">
              <span>from</span>{" "}
              <span className="value fw-6">{fmt(priceRange[0])}</span>{" "}
              <span>to</span>{" "}
              <span className="value fw-6">{fmt(priceRange[1])}</span>
            </div>
          </div>
          <Slider
            range
            min={0}
            max={PRICE_MAX}
            step={100000}
            value={priceRange}
            onChange={setPriceRange}
          />
        </div>
        <div className="widget-price">
          <div className="box-title-price">
            <span className="title-price">Area range (sqft)</span>
            <div className="caption-price">
              <span>from</span>{" "}
              <span className="value fw-6">{areaRange[0]}</span>{" "}
              <span>to</span>{" "}
              <span className="value fw-6">{areaRange[1]}</span>
            </div>
          </div>
          <Slider
            range
            min={0}
            max={AREA_MAX}
            step={100}
            value={areaRange}
            onChange={setAreaRange}
          />
        </div>
      </div>

      <div className="group-select">
        <div className="box-select">
          <DropdownSelect
            options={["City", ...cityOptionsFromDb]}
            selectedValue={city || "City"}
            onChange={(v) => setCity(v === "City" ? "" : v)}
            addtionalParentClass=""
          />
        </div>
        {!isHero && (
          <div className="box-select">
            <DropdownSelect
              options={["Listing Type", "sale", "rent"]}
              selectedValue={listingType || "Listing Type"}
              onChange={(v) =>
                setListingType(v === "Listing Type" ? "" : v)
              }
              addtionalParentClass=""
            />
          </div>
        )}
        <div className="box-select">
          <DropdownSelect
            options={["Possession", "ready", "under-construction"]}
            selectedValue={possessionStatus || "Possession"}
            onChange={(v) =>
              setPossessionStatus(v === "Possession" ? "" : v)
            }
            addtionalParentClass=""
          />
        </div>
      </div>

      {amenityList.length > 0 && (
        <div className="group-checkbox">
          <div className="title text-4 fw-6">Amenities:</div>
          <div className="group-amenities">
            {amenityList.map((a) => (
              <fieldset key={a._id} className="checkbox-item style-1">
                <label style={{ cursor: "pointer" }}>
                  <span className="text-4">{a.name}</span>
                  <input
                    type="checkbox"
                    checked={amenities.includes(toSlug(a.name))}
                    onChange={() => toggleAmenity(a)}
                  />
                  <span className="btn-checkbox" />
                </label>
              </fieldset>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid var(--Line)",
        }}
      >
        <button
          type="button"
          onClick={applyFilters}
          className="tf-btn bg-color-primary pd-3 fw-6"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="tf-btn style-1 pd-3 fw-6"
        >
          Reset All
        </button>
      </div>
    </div>
  );

  if (isHero) {
    return (
      <>
        {chipRow}
        {advancedPanel}
      </>
    );
  }

  return (
    <section className="flat-title style-2">
      <div className="tf-container">
        <div className="row">
          <div className="col-lg-12">
            <div className="title-inner">
              <ul className="breadcrumb">
                <li>
                  <Link className="home fw-6 text-color-3" href="/">
                    Home
                  </Link>
                </li>
                <li>Properties</li>
              </ul>
            </div>

            <div className="wg-filter style-2 relative">
              {/* ══ Main filter bar ══ */}
              <div className="form-title style-2">
                {/* Text search — isolated form so template max-width:390px applies only here */}
                <form onSubmit={handleSearch}>
                  <fieldset>
                    <input
                      type="text"
                      placeholder="Address, City, ZIP..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </fieldset>
                </form>

                <DropdownSelect
                  options={["Status", "available", "sold", "upcoming"]}
                  selectedValue={status || "Status"}
                  onChange={(v) => setStatus(v === "Status" ? "" : v)}
                />
                <DropdownSelect
                  options={["Type", ...propertyTypes.map((p) => p.name)]}
                  selectedValue={typeLabel}
                  onChange={(v) => {
                    if (v === "Type") return setType("");
                    const s = propertyTypes.find((p) => p.name === v);
                    setType(s?.slug || "");
                  }}
                />
                <DropdownSelect
                  options={["Baths", "1", "2", "3", "4", "5"]}
                  selectedValue={baths || "Baths"}
                  onChange={(v) => setBaths(v === "Baths" ? "" : v)}
                />
                <DropdownSelect
                  options={["Beds", "1", "2", "3", "4", "5"]}
                  selectedValue={beds || "Beds"}
                  onChange={(v) => setBeds(v === "Beds" ? "" : v)}
                />

                <div className="wrap-btn">
                  <div
                    className="btn-filter"
                    onClick={() => setPanelOpen(!panelOpen)}
                    title="More filters"
                    style={{
                      background: panelOpen
                        ? "var(--Sub-primary-2)"
                        : undefined,
                    }}
                  >
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 4H14"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 4H3"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12H12"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 12H3"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 20H16"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 20H3"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V6"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 10V14"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 18V22"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="tf-btn bg-color-primary pd-3 fw-6"
                  >
                    Search <i className="icon-MagnifyingGlass fw-6" />
                  </button>
                </div>
              </div>

              {chipRow}

              {advancedPanel}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

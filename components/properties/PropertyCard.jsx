"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  useComparison,
  MAX_COMPARE,
} from "@/components/compare/PropertyComparison";

const PLACEHOLDER = "/images/section/box-house.jpg";
const isObjectIdLike = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

const getCityLabel = (city) => {
  if (city && typeof city === "object") return city.name || "";
  if (isObjectIdLike(city)) return "";
  return city || "";
};

const getPropertyCategoryLabel = (property) => {
  const candidates = [
    property?.propertyType?.name,
    property?.propertyType?.title,
    property?.propertyCategory?.name,
    property?.propertyCategory?.title,
    property?.category?.name,
    property?.category?.title,
    property?.propertyTypeName,
    property?.categoryName,
    property?.propertyCategoryName,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate !== "string") continue;
    const value = candidate.trim();
    if (!value || isObjectIdLike(value)) continue;
    return value;
  }
  return "";
};

const getImageSrc = (property) => {
  const images = property?.images;
  if (!Array.isArray(images) || images.length === 0) {
    return property?.imageSrc || property?.image || PLACEHOLDER;
  }
  const primary = images.find((i) => i && typeof i === "object" && i.isPrimary);
  const candidate = primary || images[0];
  if (typeof candidate === "string") return candidate || PLACEHOLDER;
  if (candidate && typeof candidate === "object" && candidate.url)
    return candidate.url;
  return property?.imageSrc || property?.image || PLACEHOLDER;
};

const formatPrice = (p) => {
  if (!p) return "";
  if (p.priceType === "on-request") return "Price on Request";
  return `₹${Number(p.price || 0).toLocaleString("en-IN")}`;
};

export default function PropertyCard({ property, variant = "default" }) {
  const { addToCompare, removeFromCompare, isInCompare, count } =
    useComparison();
  const imgSrc = getImageSrc(property);
  const slug = property.slug || property._id || property.id;
  const compareId = property._id || property.id;
  const inCompare = compareId ? isInCompare(compareId) : false;
  const location = [property.address, getCityLabel(property.city)]
    .filter(Boolean)
    .join(", ");
  const beds = property.bedrooms || property.beds || 0;
  const baths = property.bathrooms || property.baths || 0;
  const sqft = property.builtUpArea || property.totalSize || property.sqft || 0;
  const garage = property.garages || property.garage || 0;
  const propertyTypeText = getPropertyCategoryLabel(property);

  if (variant === "home-list") {
    return (
      <div className="box-house hover-img style-list">
        <div className="image-wrap" style={{ height: 280, overflow: "hidden" }}>
          <Link href={`/property-detail/${slug}`}>
            <Image
              className="lazyload"
              alt={property.title || "Property"}
              src={imgSrc}
              width={435}
              height={408}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              unoptimized
            />
          </Link>
          {propertyTypeText && (
            <div
              style={{
                position: "absolute",
                top: 16,
                right: -44,
                width: 150,
                background: "var(--Primary)",
                color: "#fff",
                textAlign: "center",
                transform: "rotate(45deg)",
                transformOrigin: "center",
                zIndex: 4,
                padding: "6px 10px",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                boxShadow: "0 6px 14px rgba(15, 24, 36, 0.2)",
                pointerEvents: "none",
              }}
            >
              {propertyTypeText}
            </div>
          )}
          <div className="list-btn flex gap-8">
            <a href="#" className="btn-icon save hover-tooltip">
              <i className="icon-save" />
              <span className="tooltip">Add Favorite</span>
            </a>
            <a href="#" className="btn-icon find hover-tooltip">
              <i className="icon-find-plus" />
              <span className="tooltip">Quick View</span>
            </a>
          </div>
        </div>
        <div className="content">
          <h5 className="title">
            <Link href={`/property-detail/${slug}`}>{property.title}</Link>
          </h5>
          {location && (
            <p className="location text-1 line-clamp-1">
              <i className="icon-location" /> {location}
            </p>
          )}
          <ul className="meta-list flex">
            <li className="meta-item">
              <div className="text-9 flex">
                <i className="icon-bed" />
                Beds<span>{beds}</span>
              </div>
              <div className="text-9 flex">
                <i className="icon-sqft" />
                Sqft<span>{sqft}</span>
              </div>
            </li>
            <li className="meta-item">
              <div className="text-9 flex">
                <i className="icon-bath" />
                Baths<span>{baths}</span>
              </div>
              <div className="text-9 flex">
                <i className="icon-garage" />
                Garage<span>{garage}</span>
              </div>
            </li>
          </ul>
          <div className="bot flex justify-between items-center">
            <h5 className="price">
              ₹{Number(property.price || 0).toLocaleString("en-IN")}
            </h5>
            <div className="wrap-btn flex">
              <Link
                href={`/property-detail/${slug}`}
                className="tf-btn style-border pd-4"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="box-house hover-img">
      <div
        className="image-wrap"
        style={{ height: 220, overflow: "hidden", flexShrink: 0 }}
      >
        <Link
          href={`/property-detail/${slug}`}
          style={{ display: "block", height: "100%" }}
        >
          <Image
            className="lazyload"
            alt={property.title || "Property"}
            src={imgSrc}
            width={400}
            height={220}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            unoptimized
          />
        </Link>
        {propertyTypeText && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: -44,
              width: 150,
              background: "var(--Primary)",
              color: "#fff",
              textAlign: "center",
              transform: "rotate(45deg)",
              transformOrigin: "center",
              zIndex: 4,
              padding: "6px 10px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 14px rgba(15, 24, 36, 0.2)",
              pointerEvents: "none",
            }}
          >
            {propertyTypeText}
          </div>
        )}
        <ul className="box-tag flex gap-8">
          {(property.isFeatured || property.featured) && (
            <li className="flat-tag text-4 bg-main fw-6 text_white">
              Featured
            </li>
          )}
        </ul>
        <div className="list-btn flex gap-8">
          <Link
            href={`/property-detail/${slug}`}
            className="btn-icon find hover-tooltip"
          >
            <i className="icon-find-plus" />
            <span className="tooltip">View Details</span>
          </Link>
        </div>
      </div>
      <div className="content">
        <h5 className="title">
          <Link href={`/property-detail/${slug}`}>{property.title}</Link>
        </h5>
        <p className="location text-1 flex items-center gap-6">
          <i className="icon-location" />
          {location}
        </p>
        <ul className="meta-list flex">
          {beds > 0 && (
            <li className="text-1 flex">
              <span>{beds}</span>Beds
            </li>
          )}
          {baths > 0 && (
            <li className="text-1 flex">
              <span>{baths}</span>Baths
            </li>
          )}
          {sqft > 0 && (
            <li className="text-1 flex">
              <span>{Number(sqft).toLocaleString()}</span>
              {property.areaUnit || "Sqft"}
            </li>
          )}
        </ul>
        <div className="bot flex justify-between items-center">
          <h5 className="price">{formatPrice(property)}</h5>
          <div className="wrap-btn flex">
            <button
              className={`compare flex gap-2 items-center text-1${inCompare ? " text-color-primary" : ""}`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: inCompare ? "var(--color-primary)" : undefined,
              }}
              onClick={() => {
                if (!compareId) return;
                if (inCompare) {
                  removeFromCompare(compareId);
                  return;
                }
                if (count >= MAX_COMPARE) {
                  toast.error(
                    `You can compare up to ${MAX_COMPARE} properties`,
                  );
                  return;
                }
                addToCompare(compareId);
              }}
              title={inCompare ? "Remove from compare" : "Add to compare"}
            >
              <i className="icon-compare" />
              {inCompare ? "Added" : "Compare"}
            </button>
            <Link
              href={`/property-detail/${slug}`}
              className="tf-btn style-border pd-4"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

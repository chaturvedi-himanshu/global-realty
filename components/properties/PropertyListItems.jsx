"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import { useComparison, MAX_COMPARE } from "@/components/compare/PropertyComparison";
import { formatPropertyPriceCrLac } from "@/lib/formatPropertyPriceIN";

const PLACEHOLDER = "/images/section/box-house.jpg";
const isObjectIdLike = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
const getCityLabel = (city) => {
  if (city && typeof city === "object") return city.name || "";
  if (isObjectIdLike(city)) return "";
  return city || "";
};
const getImageSrc = (images) => {
  if (!Array.isArray(images) || images.length === 0) return PLACEHOLDER;
  const primary = images.find((i) => i && typeof i === "object" && i.isPrimary);
  const candidate = primary || images[0];
  if (typeof candidate === "string") return candidate || PLACEHOLDER;
  if (candidate && typeof candidate === "object" && candidate.url) return candidate.url;
  return PLACEHOLDER;
};

export default function PropertyListItems({ properties = [], showItems }) {
  const { addToCompare, removeFromCompare, isInCompare, count } = useComparison();
  const items = showItems ? properties.slice(0, showItems) : properties;

  if (!items.length) return null;

  return (
    <>
      {items.map((property) => {
        const imgSrc = getImageSrc(property.images);
        const slug = property.slug || property._id;
        const inCompare = isInCompare(property._id);

        return (
          <div key={property._id} className="box-house style-list hover-img">
            <div className="image-wrap" style={{ overflow: "hidden", flexShrink: 0 }}>
              <Link href={`/property-detail/${slug}`} style={{ display: "block", height: "100%" }}>
                <Image
                  className="lazyload"
                  alt={property.title || "Property"}
                  src={imgSrc}
                  width={600}
                  height={280}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  unoptimized
                />
              </Link>
              <ul className="box-tag flex gap-8">
                {property.isFeatured && (
                  <li className="flat-tag text-4 bg-main fw-6 text_white">Featured</li>
                )}
                {property.listingType && (
                  <li className="flat-tag text-4 bg-3 fw-6 text_white" style={{ textTransform: "capitalize" }}>
                    {property.listingType === "sale" ? "For Sale" : "For Rent"}
                  </li>
                )}
              </ul>
              <div className="list-btn flex gap-8">
                <Link href={`/property-detail/${slug}`} className="btn-icon find hover-tooltip">
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
                {[property.address, getCityLabel(property.city)].filter(Boolean).join(", ")}
              </p>
              <ul className="meta-list flex">
                {property.bedrooms > 0 && <li className="text-1 flex"><span>{property.bedrooms}</span>Beds</li>}
                {property.bathrooms > 0 && <li className="text-1 flex"><span>{property.bathrooms}</span>Baths</li>}
                {property.builtUpArea > 0 && (
                  <li className="text-1 flex">
                    <span>{Number(property.builtUpArea).toLocaleString()}</span>
                    {property.areaUnit || "Sqft"}
                  </li>
                )}
              </ul>
              <div className="bot flex justify-between items-center">
                <h5 className="price">
                  {formatPropertyPriceCrLac(
                    property.price,
                    property.priceType,
                    property.currency || "INR",
                  )}
                </h5>
                <div className="wrap-btn flex">
                  <button
                    className={`compare flex gap-8 items-center text-1${inCompare ? " text-color-primary" : ""}`}
                    style={{ background: "none", border: "none", cursor: "pointer", color: inCompare ? "var(--color-primary)" : undefined }}
                    onClick={() => {
                      if (inCompare) {
                        removeFromCompare(property._id);
                        return;
                      }
                      if (count >= MAX_COMPARE) {
                        toast.error(`You can compare up to ${MAX_COMPARE} properties`);
                        return;
                      }
                      addToCompare(property._id);
                    }}
                  >
                    <i className="icon-compare" />
                    {inCompare ? "Added" : "Compare"}
                  </button>
                  <Link href={`/property-detail/${slug}`} className="tf-btn style-border pd-4">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

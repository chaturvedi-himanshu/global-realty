"use client";

import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { formatPropertyPriceCrLac } from "@/lib/formatPropertyPriceIN";
import {
  buildSimilarPropertiesSearchParams,
  filterSimilarPropertyList,
} from "@/lib/similarPropertiesQuery";

const fetcher = (url) => api.get(url).then((r) => r.data);

const PLACEHOLDER = "/images/section/box-house.jpg";

function getThumbSrc(property) {
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
}

function getConfigurationLine(property) {
  const spec = String(property?.specification || "").trim();
  if (spec) return spec;
  const b = Number(property?.bedrooms || 0);
  const bath = Number(property?.bathrooms || 0);
  const parts = [];
  if (b > 0) parts.push(`${b} BHK`);
  if (bath > 0) parts.push(`${bath} bath`);
  return parts.join(" · ") || "";
}

export default function SimilarPropertiesSidebar({ property, maxItems = 3 }) {
  if (!property?._id) return null;

  const params = buildSimilarPropertiesSearchParams({
    city: property.city,
    propertyType: property.propertyType,
    limit: 24,
  });
  const swrKey = `/properties?${params}`;

  const { data, isLoading } = useSWR(swrKey, fetcher);

  const list = !isLoading
    ? filterSimilarPropertyList(data?.data, property, maxItems)
    : [];

  if (!isLoading && !list.length) return null;

  return (
    <section
      className="sidebar-similar-properties"
      aria-label="Similar properties"
    >
      <div className="sidebar-similar-properties__card">
        <h4 className="heading-title sidebar-similar-properties__title">
          Similar Properties
        </h4>
        {isLoading ? (
          <ul className="sidebar-similar-properties__list" role="list">
            {[1, 2, 3].map((i) => (
              <li key={i} className="sidebar-similar-properties__item">
                <div className="sidebar-similar-properties__skeleton" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="sidebar-similar-properties__list" role="list">
            {list.map((p) => {
              const slug = p.slug || p._id;
              const img = getThumbSrc(p);
              const title = String(p.title || "Property").trim() || "Property";
              const config = getConfigurationLine(p);
              const priceStr = formatPropertyPriceCrLac(
                p.price,
                p.priceType,
                p.currency || "INR",
              );
              const priceDisplay =
                priceStr ||
                (p.priceType === "on-request" ? "Price on request" : "—");

              return (
                <li
                  key={String(p._id)}
                  className="sidebar-similar-properties__item"
                >
                  <Link
                    href={`/property-detail/${slug}`}
                    className="sidebar-similar-properties__link"
                  >
                    <div className="sidebar-similar-properties__thumb-wrap">
                    <Image
                      src={img}
                      alt={title}
                      width={96}
                      height={80}
                        className="sidebar-similar-properties__thumb"
                        unoptimized
                      />
                    </div>
                    <div className="sidebar-similar-properties__body">
                      <span className="sidebar-similar-properties__name">
                        {title}
                      </span>
                      {config ? (
                        <span className="sidebar-similar-properties__config">
                          {config}
                        </span>
                      ) : null}
                      <span className="sidebar-similar-properties__price">
                        {priceDisplay}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

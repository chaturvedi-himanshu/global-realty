"use client";
import Link from "next/link";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { properties as FALLBACK_PROPERTIES } from "@/data/properties";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import PropertyCard from "@/components/properties/PropertyCard";

function normalizeProperty(p) {
  const primaryImage = Array.isArray(p.images)
    ? p.images.find((i) => i && typeof i === "object" && i.isPrimary) ||
      p.images[0]
    : null;
  const imageSrc =
    (typeof primaryImage === "string" ? primaryImage : primaryImage?.url) ||
    p.imageSrc ||
    p.image ||
    "/images/listings/house-1.jpg";

  return {
    id: p._id || p.id,
    slug: p.slug || p._id || p.id,
    title: p.title,
    images: p.images,
    imageSrc,
    location:
      [p.address, p.city, p.state].filter(Boolean).join(", ") ||
      p.location ||
      "",
    beds: p.beds || p.bedrooms || 0,
    baths: p.baths || p.bathrooms || 0,
    sqft: p.builtUpArea || p.area || p.sqft || 0,
    areaUnit: p.areaUnit || "Sqft",
    price: p.price || 0,
    priceType: p.priceType || "",
    listingType:
      p.listingType === "sale"
        ? "For Sale"
        : p.listingType === "rent"
          ? "For Rent"
          : p.listingType || "For Sale",
    propertyType: p.propertyType || null,
    propertyCategory: p.propertyCategory || null,
    category: p.category || null,
    propertyTypeName: p.propertyTypeName || "",
    categoryName: p.categoryName || "",
    featured: p.isFeatured || p.featured || false,
  };
}

export default function Properties({ properties: dbProperties = [] }) {
  const rawList = dbProperties.length > 0 ? dbProperties : FALLBACK_PROPERTIES;
  const properties = rawList.map(normalizeProperty);

  return (
    <section className="section-listing tf-spacing-1">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section text-center">
              <h2 className="title split-text effect-right">
                <SplitTextAnimation text="Featured Properties" />
              </h2>
              <p className="text-1 split-text split-lines-transform">
                Find your dream home from our featured properties
              </p>
            </div>
            <div
              dir="ltr"
              className="swiper style-pagination tf-sw-mobile-1 sw-swiper-767"
              data-screen={767}
              data-preview={1}
              data-space={15}
            >
              <div className="swiper-wrapper tf-layout-mobile-md md-col-2  lg-col-3 ">
                {properties.slice(0, 6).map((property) => (
                  <div key={property.id} className="swiper-slide">
                    <PropertyCard property={property} variant="home-grid" />
                  </div>
                ))}
              </div>
            </div>
            <Swiper
              dir="ltr"
              className="swiper style-pagination tf-sw-mobile-1 sw-swiper-767"
              modules={[Pagination]}
              pagination={{ clickable: true, el: ".spd446" }}
              spaceBetween={15}
            >
              {properties.slice(0, 6).map((property) => (
                <SwiperSlide key={property.id}>
                  <PropertyCard property={property} variant="home-grid" />
                </SwiperSlide>
              ))}
              <div className="sw-pagination sw-pagination-mb-1 text-center d-lg-none d-block spd446" />
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

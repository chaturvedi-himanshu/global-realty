"use client";
import React from "react";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { properties6 } from "@/data/properties";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import PropertyCard from "@/components/properties/PropertyCard";
import styles from "./Properties2Carousel.module.css";

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
    garage: p.garage || 0,
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
  };
}

export default function Properties2({ properties: dbProperties = [] }) {
  const rawList = dbProperties.length > 0 ? dbProperties : properties6;
  const properties = rawList.map(normalizeProperty).slice(0, 10);

  return (
    <section className="section-listing tf-spacing-1">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section text-center mb-48">
              <h2 className="title split-text effect-right">
                <SplitTextAnimation text="Latest Properties" />
              </h2>
              <p className="text-1 split-text split-lines-transform">
                Explore our latest properties for sale
              </p>
            </div>
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{
                clickable: true,
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 12 },
                768: { slidesPerView: 2, spaceBetween: 16 },
                1200: { slidesPerView: 3, spaceBetween: 18 },
              }}
              loop={properties.length > 3}
              className={`swiper ${styles.carousel}`}
            >
              {properties.map((property) => (
                <SwiperSlide className="swiper-slide" key={property.id}>
                  <PropertyCard property={property} variant="home-grid" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

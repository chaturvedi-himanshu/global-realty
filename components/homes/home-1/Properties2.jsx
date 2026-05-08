"use client";
import React from "react";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { properties6 } from "@/data/properties";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import PropertyCard from "@/components/properties/PropertyCard";

function normalizeProperty(p) {
  const primaryImage = Array.isArray(p.images)
    ? p.images.find((i) => i && typeof i === "object" && i.isPrimary) || p.images[0]
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
    location: [p.address, p.city, p.state].filter(Boolean).join(", ") || p.location || "",
    beds: p.beds || p.bedrooms || 0,
    baths: p.baths || p.bathrooms || 0,
    sqft: p.builtUpArea || p.area || p.sqft || 0,
    areaUnit: p.areaUnit || "Sqft",
    garage: p.garage || 0,
    price: p.price || 0,
    priceType: p.priceType || "",
    listingType: p.listingType === "sale" ? "For Sale" : p.listingType === "rent" ? "For Rent" : (p.listingType || "For Sale"),
  };
}

export default function Properties2({ properties: dbProperties = [] }) {
  const rawList =
    dbProperties.length > 0 ? dbProperties.slice(3, 9) : properties6;
  const properties = rawList.map(normalizeProperty);

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
            <div
              className="swiper style-pagination tf-sw-mobile sw-swiper-992"
              data-screen={992}
              data-preview={1}
              data-space={15}
            >
              <div className="swiper-wrapper tf-layout-mobile-lg lg-col-2 ">
                {properties.map((property) => (
                  <div className="swiper-slide" key={property.id}>
                    <PropertyCard property={property} variant="home-list" />
                  </div>
                ))}
              </div>
              <div className="sw-pagination sw-pagination-mb text-center mt-20 d-lg-none d-block" />
            </div>
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true, el: ".spd447" }}
              spaceBetween={15}
              className="swiper style-pagination tf-sw-mobile sw-swiper-992"
            >
              {properties.map((property) => (
                <SwiperSlide className="swiper-slide" key={property.id}>
                  <PropertyCard property={property} variant="home-list" />
                </SwiperSlide>
              ))}
              <div className="sw-pagination sw-pagination-mb text-center mt-20 d-lg-none d-block spd447" />
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

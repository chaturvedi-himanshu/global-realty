"use client";
import React from "react";
import Link from "next/link";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { properties6 } from "@/data/properties";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
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
    specification: p.specification || "2 BHK & 3 BHK apartments",
    title: p.title,
    images: p.images,
    imageSrc,
    address: String(p.address || "").trim(),
    location: [p.address].filter(Boolean).join(", ") || p.location || "",
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

// Ensure enough slides for a seamless infinite loop. Swiper needs at least
// ~2x slidesPerView slides, so we duplicate the source until we clear that.
function expandForLoop(items, minSlides = 6) {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (items.length >= minSlides) return items;
  const expanded = [];
  for (let i = 0; i < minSlides; i += 1) {
    expanded.push(items[i % items.length]);
  }
  return expanded;
}

export default function Properties2({ properties: dbProperties = [] }) {
  const rawList = dbProperties.length > 0 ? dbProperties : properties6;
  const properties = expandForLoop(rawList.map(normalizeProperty).slice(0, 10));

  return (
    <section className="section-listing tf-spacing-1" style={{ paddingBottom: "72px" }}>
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section text-center mb-48">
              <h2 className="title split-text effect-right">
                <SplitTextAnimation text="Latest Projects" />
              </h2>
              <p className="text-1 split-text split-lines-transform">
                Explore our latest projects for sale
              </p>
            </div>
            <div className={styles.carouselWrap}>
            <Swiper
              modules={[Autoplay]}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 12 },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 1,
                  spaceBetween: 18,
                },
              }}
              loop={true}
              loopAdditionalSlides={3}
              centeredSlides={false}
              className={`swiper ${styles.carousel}`}
            >
              {properties.map((property, idx) => (
                <SwiperSlide
                  className="swiper-slide"
                  key={`${property.id || property.slug || "property"}-${idx}`}
                >
                  <PropertyCard property={property} variant="home-grid" />
                </SwiperSlide>
              ))}
            </Swiper>
            </div>
            <div className={styles.viewAllWrap}>
              <Link
                href="/properties"
                className="tf-btn bg-color-primary pd-23"
              >
                View All Projects
                <i className="icon-arrow-right" style={{ fontSize: 16 }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { properties as FALLBACK_PROPERTIES } from "@/data/properties";
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
    reraNumber: p.reraNumber || "",
    title: p.title,
    images: p.images,
    imageSrc,
    location:
      [p.address].filter(Boolean).join(", ") ||
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

function expandForLoop(items, minSlides = 4) {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (items.length >= minSlides) return items;
  const expanded = [];
  for (let i = 0; i < minSlides; i += 1) {
    expanded.push(items[i % items.length]);
  }
  return expanded;
}

export default function Properties({ properties: dbProperties = [] }) {
  const rawList = dbProperties.length > 0 ? dbProperties : FALLBACK_PROPERTIES;
  const properties = expandForLoop(rawList.map(normalizeProperty).slice(0, 6));

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
            <Swiper
              dir="ltr"
              className={`swiper ${styles.carousel}`}
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 1.12 },
                768: { slidesPerView: 2.12 },
                1200: { slidesPerView: 3.12 },
              }}
              slidesPerGroup={1}
              spaceBetween={15}
              loop={true}
              loopedSlides={properties.length}
              loopAdditionalSlides={3}
              watchOverflow={false}
            >
              {properties.map((property, idx) => (
                <SwiperSlide key={`${property.id || property.slug || "property"}-${idx}`}>
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

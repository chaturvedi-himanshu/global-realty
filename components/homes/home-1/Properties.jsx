"use client";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { properties as FALLBACK_PROPERTIES } from "@/data/properties";
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
    specification:
      p.specification || "2 BHK & 3 BHK apartments",
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

export default function Properties({ properties: dbProperties = [] }) {
  const rawList = dbProperties.length > 0 ? dbProperties : FALLBACK_PROPERTIES;
  const properties = rawList
    .map(normalizeProperty)
    .filter((property) => property.featured)
    .slice(0, 9);

  return (
    <section className="section-listing tf-spacing-1">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section text-center">
              <h2 className="title split-text effect-right">
                <SplitTextAnimation text="Featured Projects" />
              </h2>
              <p className="text-1 split-text split-lines-transform">
                Find your dream home from our featured projects
              </p>
            </div>
            <div className="row">
              {properties.map((property, idx) => (
                <div
                  className="col-xl-4 col-md-6 mb-30"
                  key={`${property.id || property.slug || "property"}-${idx}`}
                >
                  <PropertyCard property={property} variant="home-grid" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

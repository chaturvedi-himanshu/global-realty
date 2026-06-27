"use client";

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
    specification: p.specification || "",
    title: p.title,
    images: p.images,
    imageSrc,
    address: String(p.address || "").trim(),
    location:
      [p.address].filter(Boolean).join(", ") || p.location || "",
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

export default function StaticPageProperties({ properties = [] }) {
  const items = properties.map(normalizeProperty).filter((p) => p.title);

  if (!items.length) return null;

  return (
    <section className="static-page-properties tf-spacing-1">
      <div className="tf-container">
        <div className="row">
          {items.map((property, idx) => (
            <div
              className="col-xl-4 col-md-6 mb-30"
              key={`${property.id || property.slug || "property"}-${idx}`}
            >
              <PropertyCard property={property} variant="home-grid" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

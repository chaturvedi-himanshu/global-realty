const FALLBACK_IMAGES = [
  "/images/section/property-detail-3.jpg",
  "/images/section/property-detail-4.jpg",
  "/images/section/property-detail-5.jpg",
];

/**
 * @param {unknown[]} images
 * @param {string} title
 * @returns {string[]} non-empty image URLs, primary first
 */
export function normalizePropertyImageUrls(images, title = "Property") {
  if (!Array.isArray(images) || images.length === 0) {
    return [...FALLBACK_IMAGES];
  }
  const mapped = images
    .map((img) => {
      if (typeof img === "string" && img.trim())
        return { url: img.trim(), isPrimary: false };
      if (img && typeof img === "object") {
        const url =
          img.url ||
          img.src ||
          img.image ||
          img.imageUrl ||
          img.secure_url ||
          "";
        return { url: String(url).trim(), isPrimary: Boolean(img.isPrimary) };
      }
      return null;
    })
    .filter((x) => x?.url)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  if (!mapped.length) return [...FALLBACK_IMAGES];
  return mapped.map((m) => m.url);
}

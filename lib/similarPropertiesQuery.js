/** City / state / country ref: prefer ObjectId string from populated or raw ref. */
export function getSimilarLocationRefId(v) {
  return v && typeof v === "object" ? v._id || "" : v || "";
}

/** Prefer property type slug for API; fall back to id when slug missing. */
export function getSimilarPropertyTypeQueryValue(v) {
  if (!v) return "";
  if (typeof v === "object") {
    const slug = String(v.slug || "").trim();
    if (slug) return slug;
    return v._id ? String(v._id) : "";
  }
  return String(v);
}

export function buildSimilarPropertiesSearchParams({
  city,
  propertyType,
  limit = 24,
} = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  const cityParam = getSimilarLocationRefId(city);
  const typeParam = getSimilarPropertyTypeQueryValue(propertyType);
  if (cityParam) params.set("city", String(cityParam));
  if (typeParam) params.set("propertyType", String(typeParam));
  return params;
}

export function filterSimilarPropertyList(fromApi, currentProperty, max = 3) {
  const currentId = currentProperty?._id ? String(currentProperty._id) : "";
  const merged = [];
  const seen = new Set();
  const pushUnique = (p) => {
    if (!p?._id) return;
    const id = String(p._id);
    if (currentId && id === currentId) return;
    if (seen.has(id)) return;
    seen.add(id);
    merged.push(p);
  };
  for (const p of fromApi || []) pushUnique(p);
  return merged.slice(0, max);
}

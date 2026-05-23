import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";
import Blog from "@/models/Blog";
import TeamAgent from "@/models/TeamAgent";
import StaticPage from "@/models/StaticPage";
import PropertyType from "@/models/PropertyType";
import PropertySubType from "@/models/PropertySubType";

/**
 * Public sitemap for Global Realty.
 * Includes:
 *  - Static marketing pages
 *  - Dynamic property detail pages
 *  - Blog detail pages
 *  - Team agent pages
 *  - DB-managed static pages (e.g. /privacy-policy, /terms, etc.)
 *  - Property type & subtype filter URLs (/properties?type=...&propertySubType=...)
 *
 * Excludes private routes (dashboard, admin, API, my-* pages, 404).
 *
 * Regenerated hourly so admin updates propagate without a redeploy.
 */
export const revalidate = 3600;

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"
)
  .trim()
  .replace(/\/+$/, "");

const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/properties", priority: 0.9, changeFrequency: "daily" },
  { path: "/blogs", priority: 0.8, changeFrequency: "daily" },
  { path: "/news", priority: 0.7, changeFrequency: "daily" },
  { path: "/team", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/compare", priority: 0.4, changeFrequency: "monthly" },
  { path: "/career", priority: 0.5, changeFrequency: "weekly" },
  { path: "/events", priority: 0.5, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/home-loan-process", priority: 0.5, changeFrequency: "monthly" },
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDate(value, fallback) {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

async function fetchDynamicEntries() {
  await connectDB();

  const [properties, blogs, agents, staticPages, types, subtypes] =
    await Promise.all([
      Property.find({ isActive: { $ne: false } })
        .select("slug updatedAt")
        .lean()
        .catch(() => []),
      Blog.find({ status: "published" })
        .select("slug updatedAt publishedAt")
        .lean()
        .catch(() => []),
      TeamAgent.find({ isActive: true })
        .select("slug name updatedAt")
        .lean()
        .catch(() => []),
      StaticPage.find({ status: "published" })
        .select("slug updatedAt")
        .lean()
        .catch(() => []),
      PropertyType.find({ isActive: true })
        .select("slug updatedAt")
        .lean()
        .catch(() => []),
      PropertySubType.find({ isActive: true })
        .populate("propertyType", "slug isActive")
        .select("slug propertyType updatedAt")
        .lean()
        .catch(() => []),
    ]);

  return { properties, blogs, agents, staticPages, types, subtypes };
}

export default async function sitemap() {
  const now = new Date();
  const entries = [];

  for (const route of STATIC_ROUTES) {
    entries.push({
      url: `${BASE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  let dynamicData = null;
  try {
    dynamicData = await fetchDynamicEntries();
  } catch (error) {
    console.error("[sitemap] Failed to load dynamic entries:", error);
  }

  if (!dynamicData) return entries;

  const { properties, blogs, agents, staticPages, types, subtypes } =
    dynamicData;

  for (const p of properties) {
    const slug = String(p?.slug || "").trim();
    if (!slug) continue;
    entries.push({
      url: `${BASE_URL}/property-detail/${encodeURIComponent(slug)}`,
      lastModified: toDate(p.updatedAt, now),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const b of blogs) {
    const slug = String(b?.slug || "").trim();
    if (!slug) continue;
    entries.push({
      url: `${BASE_URL}/blog-details/${encodeURIComponent(slug)}`,
      lastModified: toDate(b.updatedAt || b.publishedAt, now),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const a of agents) {
    const slug = String(a?.slug || slugify(a?.name) || "").trim();
    if (!slug) continue;
    entries.push({
      url: `${BASE_URL}/team/${encodeURIComponent(slug)}`,
      lastModified: toDate(a.updatedAt, now),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const sp of staticPages) {
    const slug = String(sp?.slug || "").trim();
    if (!slug) continue;
    entries.push({
      url: `${BASE_URL}/${encodeURIComponent(slug)}`,
      lastModified: toDate(sp.updatedAt, now),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const t of types) {
    const slug = String(t?.slug || "").trim();
    if (!slug) continue;
    entries.push({
      url: `${BASE_URL}/properties?type=${encodeURIComponent(slug)}`,
      lastModified: toDate(t.updatedAt, now),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  for (const st of subtypes) {
    const pt = st?.propertyType;
    const typeSlug = String(pt?.slug || "").trim();
    const subSlug = String(st?.slug || "").trim();
    if (!typeSlug || !subSlug || pt?.isActive === false) continue;
    entries.push({
      url: `${BASE_URL}/properties?type=${encodeURIComponent(typeSlug)}&amp;propertySubType=${encodeURIComponent(subSlug)}`,
      lastModified: toDate(st.updatedAt, now),
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  return entries;
}

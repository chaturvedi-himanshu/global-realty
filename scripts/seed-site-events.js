/**
 * Seed sample SiteEvent documents for /events (tabs + image/video cards only; no detail pages).
 *
 * Idempotent: upserts by slug.
 *
 * Usage (from proty-nextjs):
 *   node scripts/seed-site-events.js
 *   npm run seed:site-events
 */
require("dotenv").config();
require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set (.env or .env.local)");
  process.exit(1);
}

const siteEventItemSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const siteEventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    items: { type: [siteEventItemSchema], default: [] },
  },
  { timestamps: true },
);

siteEventSchema.index({ slug: 1 }, { unique: true });

const SiteEvent =
  mongoose.models.SiteEvent || mongoose.model("SiteEvent", siteEventSchema);

const SAMPLE_EVENTS = [
  {
    name: "Property Expo 2025",
    slug: "property-expo-2025",
    order: 0,
    isActive: true,
    items: [
      {
        kind: "image",
        order: 0,
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
      },
      {
        kind: "image",
        order: 1,
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
      },
      {
        kind: "image",
        order: 2,
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      },
    ],
  },
  {
    name: "Luxury launches",
    slug: "luxury-launches",
    order: 1,
    isActive: true,
    items: [
      {
        kind: "image",
        order: 0,
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      },
      {
        kind: "video",
        order: 1,
        url: "https://www.w3.org/2010/05/video/movie_300.mp4",
      },
      {
        kind: "image",
        order: 2,
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      },
    ],
  },
  {
    name: "Community & CSR",
    slug: "community-csr",
    order: 2,
    isActive: true,
    items: [
      {
        kind: "image",
        order: 0,
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
      },
      {
        kind: "image",
        order: 1,
        url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
      },
    ],
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected. Seeding site events (upsert by slug)…");

  for (const doc of SAMPLE_EVENTS) {
    const { slug, ...rest } = doc;
    const updated = await SiteEvent.findOneAndUpdate(
      { slug },
      { $set: { ...rest, slug } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    console.log(`  ✓ ${updated.name} (${slug}) — ${updated.items?.length ?? 0} media`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

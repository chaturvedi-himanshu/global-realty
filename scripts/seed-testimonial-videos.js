/**
 * Inserts sample video testimonials for local/staging UI testing.
 * Re-run safe: removes previous docs tagged with the same seed marker, then inserts fresh rows.
 *
 * Usage (from proty-nextjs):
 *   npm run seed:testimonial-videos
 *
 * Requires MONGODB_URI in .env.local
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

/** Public HTTPS sample MP4s (Google TV samples bucket — for dev only). */
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

const SEED_TAG = "seed-testimonial-videos-v1";

const now = new Date();

const docs = [
  {
    name: "Priya Sharma",
    designation: "Property investor",
    role: "Property investor",
    company: "Sample Developer Co.",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=80",
    brandLogo: "",
    video: SAMPLE_VIDEOS[0],
    message: "",
    rating: 5,
    isApproved: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    _seedTag: SEED_TAG,
  },
  {
    name: "Amit Verma",
    designation: "First-time home buyer",
    role: "First-time home buyer",
    company: "Sample Developer Co.",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&q=80",
    brandLogo: "",
    video: SAMPLE_VIDEOS[1],
    message: "",
    rating: 5,
    isApproved: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    _seedTag: SEED_TAG,
  },
  {
    name: "Neha Kapoor",
    designation: "Home maker & art enthusiast",
    role: "Home maker & art enthusiast",
    company: "Sample Developer Co.",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&q=80",
    brandLogo: "",
    video: SAMPLE_VIDEOS[2],
    message: "",
    rating: 5,
    isApproved: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    _seedTag: SEED_TAG,
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const removed = await db.collection("testimonials").deleteMany({ _seedTag: SEED_TAG });
  if (removed.deletedCount) {
    console.log(`Removed ${removed.deletedCount} previous seed testimonial(s)`);
  }

  const result = await db.collection("testimonials").insertMany(docs);
  console.log(`✓ Inserted ${result.insertedCount} video testimonials`);

  docs.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.name} — ${d.video.split("/").pop()}`);
  });

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/* eslint-disable no-console */
/**
 * One-off cleanup: align legacy `videoUrl` / `virtualTourUrl` with the
 * canonical `video` / `virtualTour` fields used by the admin form.
 *
 * - If canonical field is non-empty, mirror it into the legacy field.
 * - If canonical field is empty/missing, clear the legacy field too.
 *
 * Run from `proty-nextjs/`:
 *   node scripts/cleanup-legacy-video-fields.js
 */

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI (or MONGO_URI) in env");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const collection = mongoose.connection.collection("properties");

    const cursor = collection.find(
      {},
      { projection: { video: 1, virtualTour: 1, videoUrl: 1, virtualTourUrl: 1 } }
    );

    let scanned = 0;
    let updated = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      scanned += 1;

      const video = String(doc.video ?? "").trim();
      const virtualTour = String(doc.virtualTour ?? "").trim();
      const videoUrl = String(doc.videoUrl ?? "").trim();
      const virtualTourUrl = String(doc.virtualTourUrl ?? "").trim();

      const $set = {};
      if (video !== videoUrl) $set.videoUrl = video;
      if (virtualTour !== virtualTourUrl) $set.virtualTourUrl = virtualTour;

      if (Object.keys($set).length === 0) continue;

      await collection.updateOne({ _id: doc._id }, { $set });
      updated += 1;
    }

    console.log(`Scanned ${scanned} properties, synced ${updated}.`);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();

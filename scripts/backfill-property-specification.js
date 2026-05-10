/**
 * Sets `specification` on every property document (rotating sample strings).
 * Run from proty-nextjs: `npm run backfill:property-specification`
 *
 * After changing the text index in code, you may need to rebuild the index in MongoDB:
 *   db.properties.dropIndex("title_text_description_address_text")
 *   (then let the app recreate it on next query, or create manually including specification)
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI missing (.env.local)");
  process.exit(1);
}

const SAMPLES = [
  "2 BHK & 3 BHK apartments",
  "2 BHK, 3 BHK & 4 BHK apartments",
  "Studio, 1 BHK & 2 BHK apartments",
  "2 BHK & 3 BHK premium apartments",
  "3 BHK & 4 BHK duplex apartments",
  "2 BHK & 3 BHK garden-facing apartments",
  "1 BHK, 2 BHK & 3 BHK apartments",
  "2 BHK & 3 BHK sea-view apartments",
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.collection("properties");
  const total = await col.countDocuments({});
  let i = 0;
  const cursor = col.find({}, { projection: { _id: 1 } });
  for await (const doc of cursor) {
    const specification = SAMPLES[i % SAMPLES.length];
    await col.updateOne({ _id: doc._id }, { $set: { specification } });
    i += 1;
    if (i % 200 === 0) console.log(`Updated ${i} / ${total}…`);
  }
  console.log(`Done. Updated ${i} properties with sample specification.`);
  console.log(
    "If keyword search should match specification: drop the old text index in MongoDB, then restart the app so Mongoose can recreate it (title, description, address, specification).",
  );
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

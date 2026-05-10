/**
 * Ensure collections exist on MONGO_URI.
 *
 * Google Cloud Data Connect / Firestore Mongo compatibility often does not
 * list namespaces that have never held a document, and may drop a collection
 * when the last document is deleted. We upsert one tiny marker doc so the
 * collection stays visible and writable. Atlas (first DB) still has 0 docs in
 * these collections — remove markers later if your host supports true empty
 * collections.
 *
 * Usage: node scripts/ensure-mongo-collections-mongo-uri.js
 */
require("dotenv").config();
require("dotenv").config({
  path: require("path").join(__dirname, "../.env.local"),
  override: true,
});

const { MongoClient } = require("mongodb");

const URI = process.env.MONGO_URI;
const COLLECTIONS = ["chatleads", "featuredcities", "scriptsettings"];
const MARKER = { _protyCollectionMarker: true };

async function main() {
  if (!URI) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 60000 });
  await client.connect();
  const db = client.db();

  for (const name of COLLECTIONS) {
    const col = db.collection(name);
    const res = await col.updateOne(MARKER, { $setOnInsert: MARKER }, {
      upsert: true,
    });
    const n = await col.countDocuments();
    console.log(
      `${name}: count=${n} (${res.upsertedCount ? "created marker" : "already had marker"})`,
    );
  }

  await client.close();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

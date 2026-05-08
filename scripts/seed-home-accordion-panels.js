require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
];

function toTagline(name) {
  return `${name} opportunities curated with premium advisory, verified inventory, and end-to-end support.`;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date();

  const topSubtypes = await db
    .collection("properties")
    .aggregate([
      {
        $match: {
          isActive: { $ne: false },
          propertySubType: { $type: "objectId" },
        },
      },
      { $group: { _id: "$propertySubType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "propertysubtypes",
          localField: "_id",
          foreignField: "_id",
          as: "subtype",
        },
      },
      { $unwind: "$subtype" },
      {
        $project: {
          _id: 0,
          name: "$subtype.name",
          slug: "$subtype.slug",
          count: 1,
        },
      },
    ])
    .toArray();

  if (!topSubtypes.length) {
    console.log("No active property subtypes found from properties.");
    await mongoose.disconnect();
    return;
  }

  const payloads = topSubtypes.map((row, idx) => ({
    key: String(row.slug || row.name || `panel-${idx + 1}`)
      .toLowerCase()
      .trim(),
    label: String(row.name || "Subcategory").toUpperCase(),
    tagline: toTagline(String(row.name || "Property")),
    image: IMAGE_POOL[idx % IMAGE_POOL.length],
    href: `/properties?subType=${String(row.slug || "").trim()}`,
    order: idx,
    isActive: true,
    updatedAt: now,
  }));

  for (const payload of payloads) {
    await db.collection("homeaccordionpanels").updateOne(
      { key: payload.key },
      { $set: payload, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
  }

  console.log(`✓ Seeded/updated ${payloads.length} home accordion panels (top subcategories)`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

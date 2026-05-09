require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const DEFAULT_OVERVIEW_DATA = [
  { key: "Bedrooms", value: "4", icon: "FiHome" },
  { key: "Bathrooms", value: "3", icon: "FiDroplet" },
  { key: "Total Area", value: "2,450 sqft", icon: "FiGrid" },
  { key: "Parking", value: "2 Covered", icon: "FiTruck" },
];

const DEFAULT_OVERVIEW_CONTENT = `
<p>
  This property combines strong location fundamentals with practical day-to-day livability.
  The planning focuses on natural light, functional room sizes, and efficient circulation
  so every square foot is usable.
</p>
<p>
  From an investment perspective, the project benefits from established neighborhood demand,
  improving social infrastructure, and reliable connectivity to key commercial corridors.
  The overall layout supports both end-use and long-term value retention.
</p>
<p>
  Construction quality, ventilation, and amenity planning have been balanced to deliver a
  comfortable lifestyle while keeping maintenance practical. It is suitable for families,
  professionals, and buyers seeking a stable, future-ready home.
</p>
`.trim();

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const properties = db.collection("properties");

  const result = await properties.updateMany(
    {},
    {
      $set: {
        overviewData: DEFAULT_OVERVIEW_DATA,
        overviewContent: DEFAULT_OVERVIEW_CONTENT,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`Matched ${result.matchedCount}, updated ${result.modifiedCount} properties.`);
}

run()
  .then(() => mongoose.disconnect())
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  });

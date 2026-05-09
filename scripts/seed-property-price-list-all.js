require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const DEFAULT_PRICE_LIST = [
  {
    property: "Apartment",
    inventory: "3 BHK",
    size: "1760 Sq.Ft.",
    price: "INR 2.07 Cr",
  },
  {
    property: "Apartment",
    inventory: "4 BHK",
    size: "2175 Sq.Ft.",
    price: "INR 2.80 Cr",
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const properties = db.collection("properties");

  const result = await properties.updateMany(
    {},
    {
      $set: {
        priceList: DEFAULT_PRICE_LIST,
        updatedAt: new Date(),
      },
    },
  );

  console.log(
    `Matched ${result.matchedCount}, updated ${result.modifiedCount} properties with sample price list.`,
  );
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

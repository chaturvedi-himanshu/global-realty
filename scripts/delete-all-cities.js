/**
 * Delete all City documents from MongoDB.
 *
 * Usage (from proty-nextjs):
 *   node scripts/delete-all-cities.js
 *   npm run delete:cities
 */
require("dotenv").config();
require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI/MONGO_URI is not set (.env or .env.local)");
  process.exit(1);
}

const citySchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    slug: { type: String, default: "" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", default: null },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const City = mongoose.models.City || mongoose.model("City", citySchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const beforeCount = await City.countDocuments();
  const result = await City.deleteMany({});
  const afterCount = await City.countDocuments();

  console.log(`Cities before delete: ${beforeCount}`);
  console.log(`Deleted cities: ${result.deletedCount ?? 0}`);
  console.log(`Cities after delete: ${afterCount}`);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Failed to delete cities:", error);
  process.exit(1);
});

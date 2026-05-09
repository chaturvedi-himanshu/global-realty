require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

function buildRera(index) {
  const serial = String(index + 1).padStart(6, "0");
  return `PRM/KA/RERA/1251/310/PR/240101/${serial}`;
}

async function seedReraNumbers() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const propertiesCol = db.collection("properties");

  const rows = await propertiesCol
    .find({}, { projection: { _id: 1, reraNumber: 1 } })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  if (!rows.length) {
    console.log("No properties found.");
    return;
  }

  let updated = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const doc = rows[i];
    const current = String(doc.reraNumber || "").trim();
    if (current) continue;

    const reraNumber = buildRera(i);
    await propertiesCol.updateOne(
      { _id: doc._id },
      { $set: { reraNumber, updatedAt: new Date() } },
    );
    updated += 1;
  }

  console.log(`Updated ${updated} properties with sample RERA numbers.`);
}

seedReraNumbers()
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

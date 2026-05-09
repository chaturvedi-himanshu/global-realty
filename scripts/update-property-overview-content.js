require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return "";
  return process.argv[idx + 1] || "";
}

async function run() {
  const slug = getArg("--slug");
  const id = getArg("--id");
  const contentFile = getArg("--content-file");
  const contentText = getArg("--content");

  if (!slug && !id) {
    throw new Error("Provide either --slug or --id");
  }

  let overviewContent = String(contentText || "").trim();

  if (!overviewContent && contentFile) {
    const abs = path.isAbsolute(contentFile)
      ? contentFile
      : path.join(process.cwd(), contentFile);
    overviewContent = fs.readFileSync(abs, "utf8").trim();
  }

  if (!overviewContent) {
    throw new Error("Provide content using --content or --content-file");
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const properties = db.collection("properties");

  const query = id
    ? { _id: new mongoose.Types.ObjectId(id) }
    : { slug: String(slug).trim() };

  const res = await properties.updateOne(query, {
    $set: { overviewContent, updatedAt: new Date() },
  });

  if (!res.matchedCount) {
    throw new Error("Property not found for provided slug/id");
  }

  console.log(
    `Updated overviewContent for ${res.modifiedCount ? "1" : "0"} property.`,
  );
}

run()
  .then(() => mongoose.disconnect())
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Failed:", err.message || err);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  });

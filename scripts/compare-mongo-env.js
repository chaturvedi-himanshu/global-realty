/**
 * Compare two MongoDB deployments from env:
 * - FIRST (reference): MONGODB_URI
 * - SECOND (check): MONGO_URI
 *
 * Usage (from proty-nextjs): node scripts/compare-mongo-env.js
 * Loads .env then .env.local (later overrides).
 */
require("dotenv").config();
require("dotenv").config({
  path: require("path").join(__dirname, "../.env.local"),
  override: true,
});

const { MongoClient } = require("mongodb");

const URI_FIRST = process.env.MONGODB_URI;
const URI_SECOND = process.env.MONGO_URI;

function maskUri(u) {
  if (!u) return "(missing)";
  try {
    return u.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  } catch {
    return "(redacted)";
  }
}

async function getDbStats(uri, label) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 60000 });
  await client.connect();
  const db = client.db();
  const name = db.databaseName;
  const cols = await db.listCollections().toArray();
  const counts = {};
  for (const { name: cname } of cols) {
    counts[cname] = await db.collection(cname).countDocuments();
  }
  await client.close();
  return { name, collections: cols.map((c) => c.name).sort(), counts };
}

async function main() {
  if (!URI_FIRST || !URI_SECOND) {
    console.error("Need MONGODB_URI and MONGO_URI in env.");
    process.exit(1);
  }
  console.log("First (reference):", maskUri(URI_FIRST));
  console.log("Second (compare): ", maskUri(URI_SECOND));
  console.log("---");

  const [first, second] = await Promise.all([
    getDbStats(URI_FIRST, "first"),
    getDbStats(URI_SECOND, "second"),
  ]);

  console.log(`DB name — first: ${first.name}, second: ${second.name}`);
  console.log(`Collection count — first: ${first.collections.length}, second: ${second.collections.length}`);
  console.log("---");

  const set1 = new Set(first.collections);
  const set2 = new Set(second.collections);

  const onlyFirst = first.collections.filter((c) => !set2.has(c));
  const onlySecond = second.collections.filter((c) => !set1.has(c));

  if (onlyFirst.length) {
    console.log("Collections only on FIRST (missing on second):");
    onlyFirst.forEach((c) => console.log(`  - ${c} (${first.counts[c]} docs)`));
  } else {
    console.log("No collections only on first (second has all first collection names).");
  }

  if (onlySecond.length) {
    console.log("Collections only on SECOND (extra vs first):");
    onlySecond.forEach((c) => console.log(`  - ${c} (${second.counts[c]} docs)`));
  } else {
    console.log("No extra collections on second.");
  }

  console.log("---");
  console.log("Per-collection counts (collections present on both):");
  let mismatches = 0;
  for (const c of first.collections) {
    if (!set2.has(c)) continue;
    const n1 = first.counts[c];
    const n2 = second.counts[c];
    const ok = n1 === n2;
    if (!ok) mismatches++;
    console.log(`  ${c}: first=${n1} second=${n2} ${ok ? "OK" : "MISMATCH"}`);
  }

  console.log("---");
  if (!onlyFirst.length && !onlySecond.length && mismatches === 0) {
    console.log("RESULT: Second matches first (same collections, same counts).");
    process.exit(0);
  }
  console.log(
    `RESULT: Differences found (missing on second: ${onlyFirst.length}, extra on second: ${onlySecond.length}, count mismatches: ${mismatches}).`,
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

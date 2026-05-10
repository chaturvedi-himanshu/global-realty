/**
 * Copy all user collections (and documents) from one MongoDB database to another.
 * Uses the native driver so it works across Atlas, self-hosted, and Firestore/Data Connect–style URIs.
 *
 * Environment (set in .env.local, .env, or export in shell):
 *   SOURCE_MONGODB_URI  — source cluster (falls back to MONGODB_URI)
 *   DEST_MONGODB_URI    — destination cluster (falls back to MONGO_URI)
 *
 * Optional:
 *   SOURCE_DB — database name if not in the source URI path
 *   DEST_DB   — database name if not in the destination URI path
 *   MONGO_COPY_INDEX_DELAY_MS — ms to wait after inserts before rebuilding indexes (default 2000)
 *   MONGO_COPY_POST_DROP_MS   — ms to wait after drop() before inserts (default 3500; Firestore Mongo often needs this)
 *   MONGO_COPY_BATCH          — insert batch size (default 400; lower if dest still errors)
 *
 * Flags:
 *   --dry-run      — only list collections and counts, no writes
 *   --no-drop      — do not drop destination collections first (insert only; may duplicate _id errors)
 *   --skip-indexes — copy documents only; skip rebuilding indexes (much faster; avoids hangs on some hosts)
 *
 * Example:
 *   SOURCE_MONGODB_URI="mongodb+srv://..." DEST_MONGODB_URI="mongodb://..." node scripts/mongo-copy-all-data.js
 *
 * Do not commit real URIs or passwords to git.
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const { MongoClient } = require("mongodb");

const SOURCE_URI =
  process.env.SOURCE_MONGODB_URI || process.env.MONGODB_URI || "";
const DEST_URI =
  process.env.DEST_MONGODB_URI || process.env.MONGO_URI || "";

const DRY = process.argv.includes("--dry-run");
const NO_DROP = process.argv.includes("--no-drop");
const SKIP_INDEXES =
  process.argv.includes("--skip-indexes") ||
  process.env.MONGO_COPY_SKIP_INDEXES === "1" ||
  process.env.MONGO_COPY_SKIP_INDEXES === "true";

const BATCH = Math.max(50, Number(process.env.MONGO_COPY_BATCH || 400));

const POST_DROP_DELAY_MS = Number(process.env.MONGO_COPY_POST_DROP_MS || 3500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Managed clusters often need a beat after bulk insert before index DDL. */
const POST_INSERT_INDEX_DELAY_MS = Number(
  process.env.MONGO_COPY_INDEX_DELAY_MS || 2000,
);

function isIndexRetryable(err) {
  const msg = String(err?.message || err || "");
  return (
    /try again|being deleted|in progress|background operation|temporarily unavailable/i.test(
      msg,
    ) || err?.code === 85 || err?.code === 112
  );
}

function isIndexBenignSkip(err) {
  const msg = String(err?.message || err || "");
  return (
    err?.code === 86 ||
    err?.code === 11000 ||
    /already exists|duplicate key|same name/i.test(msg)
  );
}

/** Bulk insert aborted while destination finalizes indexes after drop (e.g. code 112). */
function isInsertManyRetryable(err) {
  const msg = String(err?.message || err || "");
  const code = err?.code;
  return (
    code === 112 ||
    /schema change|aborted due to|Retry the request|index.*used in the request/i.test(
      msg,
    )
  );
}

async function insertManyWithRetry(destCol, docs, label) {
  if (!docs.length) return;
  const max = 16;
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      await destCol.insertMany(docs, { ordered: false });
      return;
    } catch (e) {
      if (!isInsertManyRetryable(e) || attempt === max - 1) throw e;
      const wait = Math.min(15_000, 600 * 2 ** attempt);
      console.warn(
        `    ${label} insertMany retry in ${wait}ms (attempt ${attempt + 2}/${max}): ${e.code || ""} ${String(e.message || "").slice(0, 120)}`,
      );
      await sleep(wait);
    }
  }
}

function dbNameFromUri(uri) {
  const noQuery = uri.split("?")[0];
  const parts = noQuery.split("/");
  const last = parts[parts.length - 1];
  if (!last || last.includes("@")) return null;
  if (/^[^:]+:[0-9]+$/.test(last)) return null;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function pickDbName(uri, envOverride) {
  const fromUri = dbNameFromUri(uri);
  if (fromUri) return fromUri;
  if (envOverride && String(envOverride).trim()) return String(envOverride).trim();
  return null;
}

function shouldSkipCollection(name, type) {
  if (name.startsWith("system.")) return true;
  if (type && type !== "collection") return true;
  return false;
}

async function copyCollection(sourceCol, destDb, name) {
  const destCol = destDb.collection(name);
  const total = await sourceCol.countDocuments();
  if (!NO_DROP) {
    try {
      await destCol.drop();
    } catch (e) {
      if (e && e.codeName !== "NamespaceNotFound") throw e;
    }
    if (!DRY && POST_DROP_DELAY_MS > 0) {
      await sleep(POST_DROP_DELAY_MS);
    }
  }

  const cursor = sourceCol.find({}, { batchSize: BATCH });
  let buffer = [];
  let inserted = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    buffer.push(doc);
    if (buffer.length >= BATCH) {
      if (!DRY) {
        await insertManyWithRetry(destCol, buffer, name);
      }
      inserted += buffer.length;
      buffer = [];
      process.stdout.write(`\r  ${name}: ${inserted}/${total}`);
    }
  }
  if (buffer.length) {
    if (!DRY) {
      await insertManyWithRetry(destCol, buffer, name);
    }
    inserted += buffer.length;
  }
  process.stdout.write(`\r  ${name}: ${inserted}/${total}\n`);
  return { name, total, inserted };
}

function buildCreateIndexOptions(idx) {
  const allowed = [
    "name",
    "unique",
    "sparse",
    "background",
    "expireAfterSeconds",
    "partialFilterExpression",
    "collation",
    "hidden",
    "wildcardProjection",
    "default_language",
    "language_override",
    "textIndexVersion",
    "weights",
    "bits",
    "max",
    "min",
    "bucketSize",
    "2dsphereIndexVersion",
  ];
  const options = {};
  for (const k of allowed) {
    if (idx[k] !== undefined) options[k] = idx[k];
  }
  return options;
}

async function createIndexWithRetry(destCol, key, options, indexName) {
  const max = 14;
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      await destCol.createIndex(key, options);
      return;
    } catch (e) {
      if (isIndexBenignSkip(e)) return;
      if (!isIndexRetryable(e)) {
        console.warn(`    index warn ${indexName}:`, e.message || e);
        return;
      }
      if (attempt === max - 1) {
        console.warn(
          `    index failed ${indexName} after retries:`,
          e.message || e,
        );
        return;
      }
      const wait = Math.min(10_000, 500 * 2 ** attempt);
      console.warn(
        `    index retry "${indexName}" in ${wait}ms (${e.message || e.code || e})`,
      );
      await sleep(wait);
    }
  }
}

async function copyIndexes(sourceCol, destCol) {
  await sleep(POST_INSERT_INDEX_DELAY_MS);
  const indexes = await sourceCol.indexes();
  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    const key = idx.key;
    const options = buildCreateIndexOptions(idx);
    await createIndexWithRetry(destCol, key, options, idx.name);
    await sleep(150);
  }
}

async function run() {
  if (!SOURCE_URI || !DEST_URI) {
    console.error(
      "Set SOURCE_MONGODB_URI (or MONGODB_URI) and DEST_MONGODB_URI (or MONGO_URI).",
    );
    process.exit(1);
  }

  const sourceDbName = pickDbName(SOURCE_URI, process.env.SOURCE_DB);
  const destDbName = pickDbName(DEST_URI, process.env.DEST_DB);

  if (!sourceDbName || !destDbName) {
    console.error(
      "Could not read database name from URI path. Set SOURCE_DB and/or DEST_DB in env.",
    );
    process.exit(1);
  }

  console.log("Source DB:", sourceDbName);
  console.log("Dest DB:  ", destDbName);
  if (DRY) console.log("(dry-run — no writes)");
  if (SKIP_INDEXES) {
    console.log("(indexes skipped — data only; rebuild indexes later if needed)\n");
  }

  const sourceClient = new MongoClient(SOURCE_URI);
  const destClient = new MongoClient(DEST_URI);
  await sourceClient.connect();
  await destClient.connect();

  const sourceDb = sourceClient.db(sourceDbName);
  const destDb = destClient.db(destDbName);

  const collInfos = await sourceDb.listCollections().toArray();
  const userCols = collInfos.filter(
    (c) => !shouldSkipCollection(c.name, c.type),
  );

  console.log(`Found ${userCols.length} collections to copy.\n`);

  const summary = [];
  for (const info of userCols) {
    const name = info.name;
    const sourceCol = sourceDb.collection(name);
    const count = await sourceCol.countDocuments();
    console.log(`${name}: ${count} documents`);
    if (DRY) {
      summary.push({ name, total: count, inserted: 0 });
      continue;
    }
    const r = await copyCollection(sourceCol, destDb, name);
    summary.push(r);
    if (!NO_DROP && !SKIP_INDEXES) {
      const destCol = destDb.collection(name);
      await copyIndexes(sourceCol, destCol);
    }
    console.log(`  → ${name} complete\n`);
  }

  await sourceClient.close();
  await destClient.close();

  console.log("\nDone.", DRY ? "(dry-run)" : `Copied ${summary.length} collections.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

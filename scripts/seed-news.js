/**
 * Seeds the `news` collection with a curated set of real-estate news items.
 *
 * Usage (from proty-nextjs):
 *   node scripts/seed-news.js
 *   - or -
 *   npm run seed:news        (if added in package.json)
 *
 * Requires MONGODB_URI in .env.local
 *
 * Re-run safe: removes any previously-seeded docs (matched by the `seedTag`
 * field) before inserting fresh rows, so the dataset stays in sync.
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const SEED_TAG = "seed-news-v1";

const NEWS_ITEMS = [
  {
    title:
      "Housing sales in top 8 cities hit a new high as premium demand stays strong",
    description:
      "Residential sales across the country's top eight property markets touched record levels this quarter, driven by sustained demand for premium and luxury homes, according to a recent industry report.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    url: "https://economictimes.indiatimes.com/wealth/real-estate",
    source: "Economic Times",
    publishedDate: new Date("2025-04-10"),
    order: 1,
  },
  {
    title:
      "RBI keeps repo rate unchanged — what it means for home loan borrowers",
    description:
      "The Reserve Bank of India held its key lending rate steady in its latest policy review. Experts say existing and prospective home loan borrowers can continue to plan with stable EMIs in the near term.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.livemint.com/economy",
    source: "Mint",
    publishedDate: new Date("2025-04-04"),
    order: 2,
  },
  {
    title:
      "Delhi NCR emerges as one of the fastest growing luxury housing markets in India",
    description:
      "Gurugram, Noida and central Delhi are seeing a sharp rise in demand for homes priced above ₹4 crore, with developers launching new ultra-luxury projects to meet buyer appetite.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.business-standard.com/industry/real-estate",
    source: "Business Standard",
    publishedDate: new Date("2025-03-28"),
    order: 3,
  },
  {
    title:
      "Office leasing in India crosses 60 million sq ft mark, GCCs lead absorption",
    description:
      "Commercial real estate continues its strong run as Global Capability Centres (GCCs) and IT firms drive office space absorption across Bengaluru, Hyderabad, Mumbai and the NCR.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.hindustantimes.com/real-estate",
    source: "Hindustan Times",
    publishedDate: new Date("2025-03-20"),
    order: 4,
  },
  {
    title:
      "Government announces new push for affordable housing under PMAY Urban 2.0",
    description:
      "The Centre has unveiled the second phase of the Pradhan Mantri Awas Yojana (Urban) to help one crore additional urban families realise their home-ownership dream over the next five years.",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    url: "https://pib.gov.in/PressReleasePage.aspx",
    source: "PIB India",
    publishedDate: new Date("2025-03-12"),
    order: 5,
  },
  {
    title:
      "RERA tightens rules: builders must update project progress every quarter",
    description:
      "Several state-level real estate regulators are mandating quarterly disclosures from developers — including construction progress, fund utilisation and approvals — to enhance buyer protection.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.thehindu.com/business",
    source: "The Hindu",
    publishedDate: new Date("2025-03-02"),
    order: 6,
  },
  {
    title:
      "Co-living and student housing gain investor interest as demand outpaces supply",
    description:
      "Private equity inflows into managed co-living and purpose-built student housing have grown sharply, with operators expanding bed inventory across tier-1 and emerging tier-2 cities.",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.financialexpress.com/business/industry",
    source: "Financial Express",
    publishedDate: new Date("2025-02-22"),
    order: 7,
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection("news");
  const now = new Date();

  const removed = await col.deleteMany({ seedTag: SEED_TAG });
  if (removed?.deletedCount) {
    console.log(`Removed ${removed.deletedCount} previously seeded news item(s).`);
  }

  const docs = NEWS_ITEMS.map((item) => ({
    ...item,
    status: "published",
    seedTag: SEED_TAG,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await col.insertMany(docs);
  console.log(`✓ Inserted ${result.insertedCount} news item(s).`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

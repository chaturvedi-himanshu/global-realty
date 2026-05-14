/**
 * Seeds the home help center (four cards, no tabs).
 * Run from proty-nextjs: node scripts/seed-help-center-home.js
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const DEFAULT_CARDS = [
  {
    title: "Browse homes\nfor sale",
    description:
      "Shortlist verified resale and new-build options by location, budget, and property type—with clear pricing and paperwork support from day one.",
    buttonLabel: "Browse sale listings",
    buttonHref: "/properties?listingType=sale",
    icon: "house",
  },
  {
    title: "Find long-term\nrentals",
    description:
      "Explore vetted rental homes with accurate photos, society and deposit terms explained, and a team that coordinates viewings through move-in.",
    buttonLabel: "View rental homes",
    buttonHref: "/properties?listingType=rent",
    icon: "key",
  },
  {
    title: "Plan your budget\nand EMI",
    description:
      "Estimate monthly outgoings before you shortlist: adjust loan amount, tenure, and rate to compare scenarios side by side on the home page.",
    buttonLabel: "Open loan calculator",
    buttonHref: "/#loan-calculator",
    icon: "wallet",
  },
  {
    title: "List or sell\nwith confidence",
    description:
      "From fair market benchmarking and listing copy to inquiry screening and visits—we market your property to serious buyers and keep you informed.",
    buttonLabel: "Talk to our team",
    buttonHref: "/contact",
    icon: "agent",
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date();

  const $set = {
    key: "home",
    heading: "Discover how we can help",
    subheading:
      "Whether you are buying, renting, or selling, Global Realty offers verified listings, clear paperwork, and local market guidance at every step.",
    cards: DEFAULT_CARDS,
    footerLine: "Looking to spotlight a unique property with expert marketing?",
    footerCtaLabel: "Let's chat",
    footerCtaHref: "/contact",
    updatedAt: now,
  };

  await db.collection("helpcentercontents").updateOne(
    { key: "home" },
    {
      $set,
      $unset: { tabs: "" },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  console.log("✓ Home help center seeded (4 cards, legacy tabs removed if present)");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

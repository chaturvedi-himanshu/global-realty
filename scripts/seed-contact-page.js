/**
 * Seeds contact-page data into the ContactInfo collection.
 * Run:  MONGO_URI=<uri> node scripts/seed-contact-page.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI env var is required");
  process.exit(1);
}

const ContactInfoSchema = new mongoose.Schema(
  {
    phones: [String],
    emails: [String],
    address: String,
    mapEmbedUrl: String,
    workingHours: String,
    contactPageImage: String,
    contactAboutTitle: String,
    contactAboutSubtitle: String,
    aboutPageHeroTitle: String,
    aboutPageHeroSubtitle: String,
    aboutPageHeroBanner: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      twitter: String,
      whatsapp: String,
    },
    bannerTitle: String,
    bannerSubtitle: String,
    bannerImage: String,
    reraNumber: String,
    whatsappNumber: String,
    salesPhone: String,
    emailCategories: [{ label: String, email: String }],
    formTitle: String,
    formSubtitle: String,
    trustBadges: [{ icon: String, title: String, subtitle: String }],
    branchOffices: [{ city: String, reraNumber: String, address: String }],
  },
  { timestamps: true }
);

const ContactInfo =
  mongoose.models.ContactInfo ||
  mongoose.model("ContactInfo", ContactInfoSchema);

const SAMPLE = {
  // ── Hero ────────────────────────────────────────────────────────
  bannerTitle: "Contact Us",
  bannerSubtitle: "Our real estate experts are here to help you find your dream home.",
  bannerImage: "",

  // ── Corporate office ────────────────────────────────────────────
  reraNumber: "UPRERAAGT100522",
  address:
    "1st Floor, Tower Astralis, Supertech Supernova,\nPlot No. 3, Sector 94, Noida,\nUttar Pradesh - 201301",
  workingHours: "Mon–Sat: 9 AM – 6 PM",

  // ── Contact numbers ─────────────────────────────────────────────
  phones: ["+91 98765 43210", "+91 98765 43211"],
  whatsappNumber: "+91 98765 43210",
  salesPhone: "+91 98765 43212",

  // ── General emails ───────────────────────────────────────────────
  emails: ["info@globalrealty.in"],

  // ── Department emails ────────────────────────────────────────────
  emailCategories: [
    { label: "Customer Support & General Inquiries", email: "support@globalrealty.in" },
    { label: "Intimations", email: "intimations@globalrealty.in" },
    { label: "Job / Career Related", email: "careers@globalrealty.in" },
  ],

  // ── Social links ─────────────────────────────────────────────────
  socialLinks: {
    facebook: "https://facebook.com/globalrealty",
    instagram: "https://instagram.com/globalrealty",
    linkedin: "https://linkedin.com/company/globalrealty",
    youtube: "https://youtube.com/@globalrealty",
    twitter: "",
    whatsapp: "https://wa.me/919876543210",
  },

  // ── Contact form ─────────────────────────────────────────────────
  formTitle: "Contact our Real Estate Experts",
  formSubtitle: "Fill in the form and we will get back to you within 24 hours.",

  // ── Hero stats ────────────────────────────────────────────────────
  heroStats: [
    { value: "500+", label: "Projects Delivered" },
    { value: "10K+", label: "Happy Clients" },
    { value: "24h",  label: "Response Time" },
  ],

  // ── Trust badges ─────────────────────────────────────────────────
  trustBadges: [
    { icon: "🏷️", title: "Lowest Price", subtitle: "Guaranteed" },
    { icon: "🤝", title: "Full Service", subtitle: "Support" },
    { icon: "0️⃣", title: "Zero", subtitle: "Brokerage" },
  ],

  // ── Branch offices ────────────────────────────────────────────────
  branchOffices: [
    {
      city: "Gurugram Office",
      reraNumber: "HARERA/95 of 2017",
      address:
        "03–05, 16th Floor, M3M Broadway,\nGolf Course Extension Road, Sector 71,\nGurugram, Haryana – 122004",
    },
    {
      city: "Greater Noida West",
      reraNumber: "UPRERAAGT100522",
      address:
        "29th Floor, The Wing, Boulevard Walk,\nPlot No. C-2, Sector-4,\nGreater Noida West, UP – 201009",
    },
    {
      city: "Mumbai",
      reraNumber: "MAHARERA/A51700004213",
      address:
        "Office 605, 6th Floor, Ashar Millenia,\nGhodbunder Road, Kapurbawdi,\nThane West – 400610",
    },
    {
      city: "Dehradun",
      reraNumber: "UKREA02210000336",
      address:
        "IT Facility, Chrysler Tech Centre,\n21 IT Park, Sahastradhara Road,\nDehradun – 248001",
    },
    {
      city: "Mohali",
      reraNumber: "PBRERA-OTH00-REA0032",
      address:
        "IT C6, Sector 67,\nMohali, Punjab – 160062",
    },
  ],

  // ── About page fields (legacy) ───────────────────────────────────
  contactAboutTitle: "We provide the most suitable and quality real estate.",
  contactAboutSubtitle:
    "Our team of experts will guide you through every step of your property journey — from discovery to possession.",
  mapEmbedUrl: "",
  contactPageImage: "",
  aboutPageHeroTitle: "About Us",
  aboutPageHeroSubtitle: "Building trust through transparent real estate transactions.",
  aboutPageHeroBanner: "",
};

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  const before = await ContactInfo.countDocuments();
  console.log(`   Documents before: ${before}`);

  await ContactInfo.findOneAndUpdate({}, SAMPLE, { upsert: true, returnDocument: "after" });
  console.log("✅  Contact page data seeded successfully");

  await mongoose.disconnect();
  console.log("   Disconnected.");
}

main().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});

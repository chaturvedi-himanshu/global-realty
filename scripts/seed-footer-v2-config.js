require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const footerV2 = {
  brandName: "Prithvee Real Estate Services",
  brandDescription:
    "On-ground advisory for Noida, Greater Noida, and surrounding NCR micro-markets. We help with requirement discovery, inventory shortlisting, developer comparison, site visits, negotiation support, and documentation guidance for smoother closures.",
  serviceAreas: [
    "Noida (Sectors 1-168)",
    "Noida Expressway corridor",
    "Greater Noida (Alpha/Beta/Gamma)",
    "Greater Noida West (Noida Extension)",
    "Yamuna Expressway / YEIDA",
    "Jewar Airport influence zone",
    "Ecotech I/II/III industrial belt",
    "Surajpur and Kasna markets",
    "Knowledge Park zones",
    "Pari Chowk catchment",
    "Sector 150 sports-city belt",
    "Sector 137-143 rental corridor",
    "Sector 62-63 mixed commercial belt",
    "NH-24 to Noida border cluster",
    "Wave City interface belt",
    "Gaur Chowk and nearby pockets",
    "Advant/Film City office micro-market",
    "Techzone and IT parks",
    "Logix/Jaypee corridor stretch",
    "Emerging resale communities",
    "High-street retail clusters",
    "Builder floor focused pockets",
    "Luxury villa micro-locations",
    "Ready-to-move inventory pockets",
    "Under-construction investment zones",
  ],
  reraItems: [
    {
      label: "Delhi RERA Number: DLRERA2019A0113",
      url: "https://www.rera.delhi.gov.in/",
    },
    {
      label: "UP RERA Number: UPRERAAGT22169",
      url: "https://www.up-rera.in/",
    },
  ],
  trustItems: [
    "Client-first advisory with requirement mapping",
    "Transparent communication and timelines",
    "Verified project/developer shortlisting",
    "Site visit coordination and checklist support",
    "Price discovery with market comparables",
    "Negotiation support with developer sales teams",
    "Inventory option matrix and recommendation notes",
    "Documentation guidance before token/payment",
    "Post-booking follow-up support",
    "Assistance across investor and end-user journeys",
    "Clear channel-partner process handling",
    "Long-term relationship after closure",
  ],
  legalLinks: [
    { label: "Careers", href: "/career" },
    { label: "Sitemap", href: "/sitemap" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Team", href: "/team" },
    { label: "Blogs", href: "/blogs" },
    { label: "Compare", href: "/compare" },
    { label: "Properties", href: "/properties" },
  ],
  socialLinks: [
    {
      label: "Instagram",
      href: "https://instagram.com/prithveerealty",
      color: "#E1306C",
      platform: "instagram",
    },
    {
      label: "Facebook",
      href: "https://facebook.com/prithveerealty",
      color: "#1877F2",
      platform: "facebook",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/919711099993",
      color: "#25D366",
      platform: "whatsapp",
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@prithveerealty",
      color: "#FF0000",
      platform: "youtube",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/company/prithveerealty",
      color: "#0A66C2",
      platform: "linkedin",
    },
    {
      label: "X",
      href: "https://x.com/prithveerealty",
      color: "#ffffff",
      platform: "x",
    },
  ],
  badges: [
    { title: "Noida/NCR Focus", sub: "Sectors, Expressway, YEIDA, GN West" },
    { title: "Verified Options", sub: "Screened inventory + site visits" },
    { title: "Advisory Led", sub: "Need-based shortlisting and fitment" },
    { title: "Closure Support", sub: "Negotiation and documentation guidance" },
  ],
  contactPhone: "+919711099993",
  contactEmailLabel: "Contact by email form",
  contactEmailHref: "/contact",
  contactLocationTitle: "Noida, Uttar Pradesh",
  contactLocationSub: "On-site meetings by prior appointment",
  enquireLabel: "Enquire Now",
  enquireLink: "/contact",
  bottomText: "© 2026 Prithvee Real Estate Services. All rights reserved.",
};

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const siteConfig = db.collection("siteconfigs");

  await siteConfig.updateOne(
    { key: "footerV2" },
    { $set: { key: "footerV2", value: footerV2, updatedAt: new Date() } },
    { upsert: true },
  );

  await siteConfig.updateOne(
    { key: "footerText" },
    {
      $set: {
        key: "footerText",
        value: footerV2.bottomText,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );

  console.log(
    `Footer seeded: ${footerV2.serviceAreas.length} service areas, ${footerV2.trustItems.length} trust items, ${footerV2.legalLinks.length} legal links.`,
  );
}

run()
  .then(async () => {
    await mongoose.disconnect();
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

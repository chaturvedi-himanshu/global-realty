require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

function toObjectIdOrNull(value) {
  if (!value) return null;
  try {
    return new mongoose.Types.ObjectId(value);
  } catch {
    return null;
  }
}

async function resolveLocationRef(db, collection, preferredNames = []) {
  for (const name of preferredNames) {
    const row = await db
      .collection(collection)
      .findOne({ name: { $regex: `^${name}$`, $options: "i" } }, { projection: { _id: 1 } });
    if (row?._id) return row._id;
  }
  const fallback = await db.collection(collection).findOne({}, { projection: { _id: 1 } });
  return fallback?._id || null;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date();

  const propertyType =
    (await db.collection("propertytypes").findOne({ isActive: { $ne: false } }, { projection: { _id: 1 } })) ||
    (await db.collection("propertytypes").findOne({}, { projection: { _id: 1 } }));

  const propertySubType =
    (await db.collection("propertysubtypes").findOne({ isActive: { $ne: false } }, { projection: { _id: 1 } })) ||
    (await db.collection("propertysubtypes").findOne({}, { projection: { _id: 1 } }));

  const amenityRows = await db
    .collection("amenities")
    .find({ isActive: { $ne: false } }, { projection: { _id: 1 } })
    .limit(14)
    .toArray();

  const cityId = await resolveLocationRef(db, "cities", ["Noida", "Greater Noida", "Delhi"]);
  const stateId = await resolveLocationRef(db, "states", ["Uttar Pradesh", "Delhi"]);
  const countryId = await resolveLocationRef(db, "countries", ["India"]);

  const slug = "ultra-luxury-skyline-residences-sector-150-noida";

  const propertyDoc = {
    propertyId: "GR-PROP-ULTRA-150-0001",
    reraNumber: "UPRERAPRJ980442",
    specification: "2 BHK, 3 BHK & 4 BHK apartments",
    title: "Ultra Luxury Skyline Residences - Sector 150, Noida",
    slug,
    description: `
      <p><strong>Ultra Luxury Skyline Residences</strong> is a landmark residential offering in Sector 150, Noida, designed for buyers who expect a rare blend of architecture, wellness-driven planning, and long-horizon investment value.</p>
      <p>The project presents low-density tower planning, expansive landscaped podiums, and oversized living formats crafted for premium end-use families as well as selective investors targeting high-quality, future-ready micro-markets. From arrival lobbies to private deck lines, each design decision focuses on space, light, and privacy.</p>
      <p>Residences are configured for contemporary urban needs with larger utility cores, practical storage zones, flexible study/work areas, and generous living-dining transitions that support both day-to-day routines and social hosting. The material palette combines durability with elegance, enabling low-maintenance long-term ownership.</p>
      <p>Sector 150 remains one of Noida's strongest growth corridors due to its sports-city ecosystem, superior road network access, broad arterial connectivity, and evolving social infrastructure. The location offers balanced liveability, institutional depth, and sustained end-user demand.</p>
      <p>For buyers seeking quality inventory with strong project fundamentals, this development delivers compelling value across planning, execution, and location logic. It is positioned as a premium address for lifestyle-first ownership without compromising investment discipline.</p>
      <p>The project includes wide internal roads, drop-off plazas, premium concierge lobby zones, resort-inspired landscape pockets, and a modern clubhouse ecosystem that caters to all age groups. Dedicated senior citizen zones, children-friendly active lawns, and thoughtfully separated service circulation ensure cleaner everyday functionality.</p>
      <p>Each residence stack is designed to maintain high natural ventilation efficiency and optimal sun orientation. Balcony decks are planned for usable outdoor living, while utility spaces are engineered for practical operation with appliances, storage, and helper movement in mind.</p>
      <p>For investment-minded buyers, this asset category benefits from high-quality demand depth, improved rental aspiration in the expressway corridor, and long-term appreciation potential tied to metro expansion, airport ecosystem growth, and premium social infrastructure adoption.</p>
      <p>Whether your objective is primary self-use, future family transition, or portfolio-grade capital placement, this project aligns with premium urban aspirations and disciplined real-estate decision making.</p>
    `.trim(),

    price: 48500000,
    priceType: "fixed",
    currency: "INR",

    status: "available",
    listingType: "sale",
    label: "Featured",
    propertyType: propertyType?._id || null,
    propertySubType: propertySubType?._id || null,

    images: [
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&auto=format&fit=crop", alt: "Front elevation view", isPrimary: true, order: 0 },
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&auto=format&fit=crop", alt: "Premium facade and landscape", isPrimary: false, order: 1 },
      { url: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1800&auto=format&fit=crop", alt: "Living room interior concept", isPrimary: false, order: 2 },
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&auto=format&fit=crop", alt: "Master suite concept", isPrimary: false, order: 3 },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1800&auto=format&fit=crop", alt: "Kitchen and dining concept", isPrimary: false, order: 4 },
    ],
    videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    video: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    virtualTourUrl: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    virtualTour: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
    attachments: [
      { name: "Official Project Brochure (Phase 1)", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileType: "pdf" },
      { name: "Detailed Price List - Inventory Wise", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileType: "pdf" },
      { name: "Construction Linked Payment Plan", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileType: "pdf" },
      { name: "Master Layout & Tower Placement", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileType: "pdf" },
      { name: "Floor Plan Compendium (All Types)", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileType: "pdf" },
    ],

    address: "Sector 150, Noida Expressway, Gautam Buddha Nagar",
    zipCode: "201310",
    pincode: "201310",
    city: cityId || "Noida",
    state: stateId || "Uttar Pradesh",
    country: countryId || "India",
    latitude: 28.4083,
    longitude: 77.4842,
    mapEmbedUrl: "https://www.google.com/maps?q=28.4083,77.4842&z=14&output=embed",

    bedrooms: 4,
    bathrooms: 5,
    balconies: 4,
    garages: 2,
    garageSize: 320,
    totalSize: 3650,
    landSize: 0,
    builtUpArea: 3380,
    superBuiltUpArea: 3650,
    carpetArea: 2860,
    areaUnit: "sqft",
    yearBuilt: 2026,
    rooms: 8,
    floorNumber: 18,
    floors: 1,
    totalFloors: 35,
    furnishingStatus: "semi-furnished",
    facing: "North-East",
    parkingType: "covered",
    possessionStatus: "under-construction",
    possessionDate: new Date("2028-12-31"),
    availableFrom: new Date("2028-01-01"),
    propertyAge: 0,

    amenities: amenityRows.map((a) => a._id),
    features: [
      { label: "Developer", value: "Global Signature Developers" },
      { label: "Project Category", value: "Ultra Luxury Residential" },
      { label: "Configuration", value: "4 BHK + Family Lounge + Utility" },
      { label: "Tower Height", value: "G+35 High-rise Towers" },
      { label: "Clubhouse", value: "80,000+ sq.ft integrated wellness club" },
      { label: "Total Land Parcel", value: "11.4 Acres" },
      { label: "Open Green Coverage", value: "Approx. 70%" },
      { label: "Ceiling Height", value: "Approx. 11 ft clear height in living areas" },
      { label: "Lift Core", value: "High-speed destination control elevators" },
      { label: "Power Backup", value: "100% backup for apartment and common areas" },
      { label: "Water Management", value: "Dual plumbing + rainwater harvesting + STP reuse" },
      { label: "Fire & Life Safety", value: "Addressable detection + sprinklers + pressurized staircases" },
      { label: "Basement Design", value: "Multi-level podium + basement parking with clear circulation" },
      { label: "Green Planning", value: "Low-density planning with large open green zones" },
      { label: "Security", value: "5-tier security + CCTV + smart access control" },
    ],

    floorPlans: [
      {
        name: "4 BHK Premium - Type A",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&auto=format&fit=crop",
        bedrooms: 4,
        bathrooms: 5,
        size: 3650,
      },
      {
        name: "4 BHK Premium - Type B",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&auto=format&fit=crop",
        bedrooms: 4,
        bathrooms: 5,
        size: 3490,
      },
    ],

    nearby: [
      {
        category: "Education",
        icon: "FaSchool",
        places: [
          { name: "Lotus Valley International School", distance: "4.8 km" },
          { name: "Amity University Noida", distance: "11.2 km" },
          { name: "Shiv Nadar School", distance: "8.1 km" },
        ],
      },
      {
        category: "Healthcare",
        icon: "FaHospital",
        places: [
          { name: "Yatharth Super Speciality Hospital", distance: "6.5 km" },
          { name: "Jaypee Hospital", distance: "13.4 km" },
          { name: "Felix Hospital", distance: "9.7 km" },
        ],
      },
      {
        category: "Connectivity",
        icon: "FaRoad",
        places: [
          { name: "Noida-Greater Noida Expressway", distance: "2.3 km" },
          { name: "Sector 148 Metro Station", distance: "4.1 km" },
          { name: "Jewar International Airport (upcoming)", distance: "37 km" },
        ],
      },
    ],

    reviews: [
      {
        name: "Rohit S.",
        email: "rohit.buyer@example.com",
        avatar: "",
        rating: 5,
        review: "Project planning, open areas, and the tower orientation are excellent. Sales process was transparent and documentation support was timely.",
        isApproved: true,
        createdAt: new Date("2026-04-12"),
      },
      {
        name: "Ananya M.",
        email: "ananya.investor@example.com",
        avatar: "",
        rating: 4,
        review: "Strong location thesis and premium product quality. Good for long-term holding with both end-user and rental potential in the corridor.",
        isApproved: true,
        createdAt: new Date("2026-04-22"),
      },
    ],
    averageRating: 4.5,
    totalReviews: 2,

    loanDefaults: {
      downPaymentPercent: 20,
      interestRate: 8.35,
      amortizationMonths: 240,
      propertyTaxMonthly: 9000,
      homeInsuranceMonthly: 3200,
    },

    overviewData: [
      { key: "Configuration", value: "4 BHK + Lounge", icon: "FiHome" },
      { key: "Super Area", value: "3650 sq.ft", icon: "FiMaximize2" },
      { key: "Possession", value: "Dec 2028", icon: "FiCalendar" },
      { key: "Clubhouse", value: "80,000+ sq.ft", icon: "FiActivity" },
      { key: "Parking", value: "2 Covered", icon: "FiTruck" },
      { key: "Green Zone", value: "70% Open Area", icon: "FiWind" },
    ],
    overviewContent: `
      <h3>Project Overview</h3>
      <p>This development is curated for buyers who value build quality, privacy, and long-term location upside. The master planning follows low-density tower placement with strong daylight entry, cross-ventilation, and wide landscaped buffers.</p>
      <p>Homes are designed with larger living frontage, efficient circulation, and practical utility zoning. The project also offers a comprehensive amenity program focused on wellness, fitness, leisure, and community engagement.</p>
      <p>From an investment perspective, Sector 150 has demonstrated resilient demand due to its superior road connectivity, sports-centric planning, and sustained infrastructure upgrades across the expressway corridor.</p>
      <ul>
        <li>Premium high-rise architecture with modern facade identity</li>
        <li>Large clubhouse, wellness zones, and lifestyle amenities</li>
        <li>High-end security and smart access ecosystem</li>
        <li>Strong social infrastructure and metro-road connectivity</li>
      </ul>
      <p>The overall proposition combines lifestyle quality with practical long-term value creation. Every component, from entry sequencing to apartment efficiency, is engineered to reduce ownership friction and improve daily life quality.</p>
      <p><strong>Design & Planning:</strong> Low tower density, high open-space ratio, premium lobbies, and curated arrival/drop-off planning provide a high-end living identity while maintaining functional movement for residents and visitors.</p>
      <p><strong>Construction & Delivery:</strong> The project follows process-driven execution with phase-wise quality checks, contractor supervision frameworks, and standardized MEP coordination to ensure build consistency.</p>
      <p><strong>Lifestyle Stack:</strong> Wellness amenities include fitness studios, lap pool formats, indoor games lounges, dedicated co-working zones, and curated community spaces designed for family-centric urban living.</p>
      <p><strong>Location Intelligence:</strong> Strong expressway access, upcoming airport influence, and metro-linked movement continue to support long-term livability and investment confidence in the micro-market.</p>
      <p><strong>Who should consider this asset:</strong> End-users seeking spacious premium homes, families planning long-term upgrade moves, and investors targeting high-quality residential corridors with constrained luxury inventory supply.</p>
    `.trim(),
    priceList: [
      { property: "4 BHK Type A", inventory: "Tower C - Mid Floor", size: "3650 sq.ft", price: "INR 4,85,00,000" },
      { property: "4 BHK Type B", inventory: "Tower D - High Floor", size: "3490 sq.ft", price: "INR 4,55,00,000" },
      { property: "4 BHK + Lounge", inventory: "Tower B - Premium Deck", size: "3810 sq.ft", price: "INR 5,12,00,000" },
      { property: "Limited Corner Unit", inventory: "Tower A - Signature Stack", size: "3920 sq.ft", price: "INR 5,38,00,000" },
      { property: "4 BHK Signature", inventory: "Tower E - Park Facing", size: "3745 sq.ft", price: "INR 4,96,00,000" },
      { property: "4 BHK Reserve Collection", inventory: "Tower F - Upper Premium", size: "3888 sq.ft", price: "INR 5,24,00,000" },
      { property: "4 BHK Grand Deck", inventory: "Tower A - Skyline Band", size: "4010 sq.ft", price: "INR 5,62,00,000" },
    ],

    agentId: null,
    agent: {
      name: "Elite Advisory Desk",
      email: "advisory@globalrealty.example",
      phone: "+91 97110 99993",
      avatar: "",
    },

    tags: [
      "noida sector 150",
      "luxury apartments noida",
      "4 bhk expressway",
      "rera approved",
      "premium residences",
      "investment corridor",
    ],
    views: 1280,
    viewsCount: 1280,

    isActive: true,
    isFeatured: true,
    isNew: true,
    isPremium: true,

    metaTitle: "Ultra Luxury Skyline Residences Sector 150 Noida | Price, Floor Plans & Offers",
    metaDescription:
      "Explore Ultra Luxury Skyline Residences in Sector 150, Noida. Check latest price list, floor plans, amenities, RERA details, and schedule your site visit.",
    metaKeywords:
      "sector 150 noida luxury property, 4 bhk noida expressway, skyline residences noida, rera property noida",

    updatedAt: now,
  };

  const result = await db.collection("properties").updateOne(
    { slug },
    {
      $set: propertyDoc,
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  if (result.upsertedCount > 0) {
    console.log(`Inserted full property seed with slug: ${slug}`);
  } else if (result.modifiedCount > 0) {
    console.log(`Updated existing full property seed with slug: ${slug}`);
  } else {
    console.log(`No change needed for full property seed with slug: ${slug}`);
  }
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

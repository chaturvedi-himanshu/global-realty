require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");
const slugify = require("slugify");

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required in .env.local");
}

const now = new Date();

const propertySeed = [
  { id: 1, name: "M3M The Cullinan", city: "Noida", location: "Sector 94, Noida", developer: "M3M India", type: "Luxury High-rise", configuration: ["3 BHK", "4 BHK", "5 BHK"], priceRange: { min: "5 Cr", max: "15 Cr" }, status: "Under Construction", featured: true },
  { id: 2, name: "Max Estates 128", city: "Noida", location: "Sector 128, Noida", developer: "Max Estates", type: "Ultra-Luxury Low-rise", configuration: ["4 BHK", "5 BHK"], priceRange: { min: "8 Cr", max: "20 Cr" }, status: "Under Construction", featured: true },
  { id: 3, name: "ATS Knightsbridge", city: "Noida", location: "Sector 124, Noida", developer: "ATS Greens", type: "Ultra-Premium", configuration: ["4 BHK", "6 BHK"], priceRange: { min: "10 Cr", max: "25 Cr" }, status: "Under Construction", featured: true },
  { id: 4, name: "Godrej Woods", city: "Noida", location: "Sector 43, Noida", developer: "Godrej Properties", type: "Forest-themed Luxury", configuration: ["3 BHK", "4 BHK", "5 BHK"], priceRange: { min: "3.5 Cr", max: "9 Cr" }, status: "Ready to Move", featured: true },
  { id: 5, name: "Godrej Jardinia", city: "Noida", location: "Sector 146, Noida", developer: "Godrej Properties", type: "European-style Luxury", configuration: ["2 BHK", "3 BHK"], priceRange: { min: "1.8 Cr", max: "4 Cr" }, status: "Under Construction", featured: false },
  { id: 6, name: "Experion Elements", city: "Noida", location: "Sector 45, Noida", developer: "Experion Developers", type: "Low-density Premium", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "4 Cr", max: "8 Cr" }, status: "Under Construction", featured: true },
  { id: 7, name: "Mahagun Medalleo", city: "Noida", location: "Sector 107, Noida", developer: "Mahagun Group", type: "IGBC Gold Certified", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "2.5 Cr", max: "6 Cr" }, status: "Under Construction", featured: false },
  { id: 8, name: "Mahagun Manorialle", city: "Noida", location: "Sector 128, Noida", developer: "Mahagun Group", type: "Premium High-rise", configuration: ["4 BHK", "5 BHK"], priceRange: { min: "4 Cr", max: "10 Cr" }, status: "Under Construction", featured: false },
  { id: 9, name: "ATS Picturesque Reprieves", city: "Noida", location: "Sector 152, Noida", developer: "ATS Group", type: "Green Township", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "2 Cr", max: "5 Cr" }, status: "Ready to Move", featured: false },
  { id: 10, name: "ATS Pious Orchards", city: "Noida", location: "Sector 150, Noida", developer: "ATS Group", type: "Golf-facing Luxury", configuration: ["3 BHK", "5 BHK"], priceRange: { min: "3 Cr", max: "7 Cr" }, status: "Ready to Move", featured: true },
  { id: 11, name: "Tata Eureka Park", city: "Noida", location: "Sector 150, Noida", developer: "Tata Housing", type: "Smart Homes", configuration: ["2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "1.5 Cr", max: "4 Cr" }, status: "Ready to Move", featured: false },
  { id: 12, name: "Kalpataru Vista", city: "Noida", location: "Sector 128, Noida", developer: "Kalpataru Group", type: "Premium Apartments", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "3 Cr", max: "7 Cr" }, status: "Under Construction", featured: false },
  { id: 13, name: "L&T Green Reserve", city: "Noida", location: "Sector 128, Noida", developer: "L&T Realty", type: "Eco-Luxury", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "3.5 Cr", max: "8 Cr" }, status: "Under Construction", featured: true },
  { id: 14, name: "The Islands by Gaurs", city: "Noida", location: "Sector 79, Noida", developer: "Gaurs Group", type: "Island-concept Luxury", configuration: ["4 BHK", "5 BHK"], priceRange: { min: "3 Cr", max: "8 Cr" }, status: "Under Construction", featured: false },
  { id: 15, name: "Ace Starlit", city: "Noida", location: "Sector 152, Noida", developer: "Ace Group", type: "Premium High-rise", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "1.8 Cr", max: "4.5 Cr" }, status: "Under Construction", featured: false },
  { id: 16, name: "Eldeco Edge", city: "Noida", location: "Sector 119, Noida", developer: "Eldeco Group", type: "Mid-range Apartments", configuration: ["1 BHK", "2 BHK"], priceRange: { min: "1.14 Cr", max: "2 Cr" }, status: "Ready to Move", featured: false },
  { id: 17, name: "Sikka Kaamna Greens", city: "Noida", location: "Sector 143, Noida", developer: "Sikka Group", type: "Ready-to-Move", configuration: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "80 L", max: "2.5 Cr" }, status: "Ready to Move", featured: false },
  { id: 18, name: "Amrapali Hanging Gardens", city: "Noida", location: "Sector 107, Noida", developer: "Amrapali Group", type: "Lifestyle Project", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "70 L", max: "2 Cr" }, status: "Ready to Move", featured: false },
  { id: 19, name: "Ajnara Elements", city: "Noida", location: "Sector 137, Noida", developer: "Ajnara Developers", type: "Affordable Premium", configuration: ["1 BHK", "2 BHK"], priceRange: { min: "55 L", max: "1.2 Cr" }, status: "Ready to Move", featured: false },
  { id: 20, name: "Paramount Emotions", city: "Noida", location: "Sector 1, Noida Extension", developer: "Paramount Propbuild", type: "Mid-segment", configuration: ["2 BHK", "3 BHK"], priceRange: { min: "60 L", max: "1.8 Cr" }, status: "Ready to Move", featured: false },
  { id: 21, name: "Lodha Bellevue", city: "Mumbai", location: "Mahalaxmi, Mumbai", developer: "Lodha Group", type: "Ultra-Luxury", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "8 Cr", max: "20 Cr" }, status: "Ready to Move", featured: true },
  { id: 22, name: "Kalpataru Vivanta JVLR", city: "Mumbai", location: "Jogeshwari-Vikhroli Link Road, Mumbai", developer: "Kalpataru Group", type: "Premium Mid-rise", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "2 Cr", max: "5.5 Cr" }, status: "Ready to Move", featured: false },
  { id: 23, name: "Godrej Infinity", city: "Mumbai", location: "BKC Area, Mumbai", developer: "Godrej Properties", type: "Green Luxury", configuration: ["2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "3 Cr", max: "7 Cr" }, status: "Under Construction", featured: true },
  { id: 24, name: "Rustomjee Seasons", city: "Mumbai", location: "Bandra East, Mumbai", developer: "Rustomjee", type: "Premium Lifestyle", configuration: ["2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "5 Cr", max: "14 Cr" }, status: "Ready to Move", featured: true },
  { id: 25, name: "Hiranandani Gardens", city: "Mumbai", location: "Powai, Mumbai", developer: "Hiranandani Group", type: "Integrated Township", configuration: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "2.5 Cr", max: "9 Cr" }, status: "Ready to Move", featured: true },
  { id: 26, name: "Sobha Dream Acres", city: "Bangalore", location: "Panathur, Whitefield, Bangalore", developer: "Sobha Group", type: "Large Township", configuration: ["1 BHK", "2 BHK"], priceRange: { min: "85 L", max: "1.8 Cr" }, status: "Ready to Move", featured: true },
  { id: 27, name: "Prestige Lakeside Habitat", city: "Bangalore", location: "Whitefield, Bangalore", developer: "Prestige Group", type: "Lake-facing Township", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "1.2 Cr", max: "3 Cr" }, status: "Ready to Move", featured: true },
  { id: 28, name: "Brigade Orchards", city: "Bangalore", location: "Devanahalli, North Bangalore", developer: "Brigade Group", type: "Plotted Township", configuration: ["Plots", "Villas"], priceRange: { min: "1.5 Cr", max: "6 Cr" }, status: "Under Construction", featured: false },
  { id: 29, name: "Phoenix Golf Edge", city: "Bangalore", location: "Kogilu, North Bangalore", developer: "Phoenix Group", type: "Golf-themed Premium", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "2.5 Cr", max: "6 Cr" }, status: "Under Construction", featured: false },
  { id: 30, name: "Godrej Woodscapes", city: "Bangalore", location: "Whitefield, Bangalore", developer: "Godrej Properties", type: "Nature-themed", configuration: ["2 BHK", "3 BHK"], priceRange: { min: "1.2 Cr", max: "3.5 Cr" }, status: "Under Construction", featured: false },
  { id: 31, name: "DLF The Crest", city: "Gurgaon", location: "DLF 5, Sector 54, Gurgaon", developer: "DLF Limited", type: "Ultra-Premium", configuration: ["3 BHK", "4 BHK", "5 BHK"], priceRange: { min: "6 Cr", max: "18 Cr" }, status: "Ready to Move", featured: true },
  { id: 32, name: "M3M Golf Estate", city: "Gurgaon", location: "Sector 65, Golf Course Extension, Gurgaon", developer: "M3M India", type: "Golf-facing Luxury", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "4 Cr", max: "12 Cr" }, status: "Ready to Move", featured: true },
  { id: 33, name: "Godrej Meridien", city: "Gurgaon", location: "Sector 106, Dwarka Expressway, Gurgaon", developer: "Godrej Properties", type: "Premium High-rise", configuration: ["2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "2 Cr", max: "6 Cr" }, status: "Ready to Move", featured: false },
  { id: 34, name: "Sobha City", city: "Gurgaon", location: "Sector 108, Dwarka Expressway, Gurgaon", developer: "Sobha Group", type: "Integrated Township", configuration: ["2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "2.5 Cr", max: "7 Cr" }, status: "Under Construction", featured: false },
  { id: 35, name: "Emaar The Enclave", city: "Gurgaon", location: "Sector 66, Gurgaon", developer: "Emaar India", type: "Premium Villas", configuration: ["4 BHK Villa", "5 BHK Villa"], priceRange: { min: "5 Cr", max: "15 Cr" }, status: "Under Construction", featured: true },
  { id: 36, name: "Phoenix Kessaku", city: "Hyderabad", location: "Kokapet, Financial District, Hyderabad", developer: "Phoenix Group", type: "Ultra-Luxury", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "3.5 Cr", max: "9 Cr" }, status: "Ready to Move", featured: true },
  { id: 37, name: "Prestige Ivy League", city: "Hyderabad", location: "Miyapur, HiTEC Corridor, Hyderabad", developer: "Prestige Group", type: "Premium High-rise", configuration: ["2 BHK", "3 BHK", "4 BHK"], priceRange: { min: "1.2 Cr", max: "3.5 Cr" }, status: "Ready to Move", featured: false },
  { id: 38, name: "Sobha HRC Pristine", city: "Hyderabad", location: "Gachibowli, Hyderabad", developer: "Sobha Group", type: "IT Corridor Luxury", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "2 Cr", max: "5 Cr" }, status: "Ready to Move", featured: false },
  { id: 39, name: "My Home Apas", city: "Hyderabad", location: "Gachibowli, Hyderabad", developer: "My Home Constructions", type: "Premium Lifestyle", configuration: ["3 BHK", "4 BHK"], priceRange: { min: "2.5 Cr", max: "6 Cr" }, status: "Under Construction", featured: false },
  { id: 40, name: "Aparna Cyber Life", city: "Hyderabad", location: "Kondapur, HITEC City, Hyderabad", developer: "Aparna Constructions", type: "Tech-Corridor Premium", configuration: ["2 BHK", "3 BHK"], priceRange: { min: "1 Cr", max: "2.8 Cr" }, status: "Ready to Move", featured: false },
  { id: 41, name: "Godrej Infinity Pune", city: "Pune", location: "Keshavnagar, Mundhwa, Pune", developer: "Godrej Properties", type: "Green Luxury", configuration: ["2 BHK", "3 BHK"], priceRange: { min: "1.2 Cr", max: "3 Cr" }, status: "Ready to Move", featured: true },
  { id: 42, name: "Pride World City", city: "Pune", location: "Charholi, North Pune", developer: "Pride Group", type: "Mega Township", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "65 L", max: "2.5 Cr" }, status: "Under Construction", featured: false },
  { id: 43, name: "Prestige Primrose Hills", city: "Pune", location: "Bavdhan, Pune", developer: "Prestige Group", type: "Premium Hillside", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "90 L", max: "2.8 Cr" }, status: "Under Construction", featured: false },
  { id: 44, name: "Kolte Patil Life Republic", city: "Pune", location: "Hinjewadi, Wakad, Pune", developer: "Kolte-Patil", type: "IT Corridor Township", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "75 L", max: "2.2 Cr" }, status: "Under Construction", featured: false },
  { id: 45, name: "Godrej 24", city: "Pune", location: "Hinjewadi Phase 1, Pune", developer: "Godrej Properties", type: "Gated Community", configuration: ["1 BHK", "2 BHK", "3 BHK"], priceRange: { min: "80 L", max: "2.5 Cr" }, status: "Ready to Move", featured: false },
];

const imagePool = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1600&auto=format&fit=crop",
];

function priceToNumber(raw) {
  const cleaned = String(raw).trim().toUpperCase();
  const num = parseFloat(cleaned.replace(/[^\d.]/g, ""));
  if (cleaned.includes("CR")) return Math.round(num * 10000000);
  if (cleaned.includes("L")) return Math.round(num * 100000);
  return Math.round(num);
}

function maxBedrooms(configuration) {
  let max = 0;
  for (const conf of configuration) {
    const match = conf.match(/\d+/);
    if (match) max = Math.max(max, Number(match[0]));
  }
  return max || 2;
}

function minBedrooms(configuration) {
  let min = Infinity;
  for (const conf of configuration) {
    const match = conf.match(/\d+/);
    if (match) min = Math.min(min, Number(match[0]));
  }
  return Number.isFinite(min) ? min : 2;
}

function randomFrom(arr, idx) {
  return arr[idx % arr.length];
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log("Connected to MongoDB");

    const propertyTypes = [
      { name: "Apartment", slug: "apartment", icon: "🏢", isActive: true, createdAt: now, updatedAt: now },
      { name: "Villa", slug: "villa", icon: "🏡", isActive: true, createdAt: now, updatedAt: now },
      { name: "Township", slug: "township", icon: "🏘️", isActive: true, createdAt: now, updatedAt: now },
      { name: "Luxury", slug: "luxury", icon: "✨", isActive: true, createdAt: now, updatedAt: now },
    ];
    await db.collection("propertytypes").deleteMany({});
    const propertyTypeResult = await db.collection("propertytypes").insertMany(propertyTypes);
    const propertyTypeIds = Object.values(propertyTypeResult.insertedIds);

    const subTypes = [
      { name: "High-rise Apartment", slug: "high-rise-apartment", propertyType: propertyTypeIds[0], isActive: true, createdAt: now, updatedAt: now },
      { name: "Low-rise Apartment", slug: "low-rise-apartment", propertyType: propertyTypeIds[0], isActive: true, createdAt: now, updatedAt: now },
      { name: "Luxury Villa", slug: "luxury-villa", propertyType: propertyTypeIds[1], isActive: true, createdAt: now, updatedAt: now },
      { name: "Integrated Township", slug: "integrated-township", propertyType: propertyTypeIds[2], isActive: true, createdAt: now, updatedAt: now },
    ];
    await db.collection("propertysubtypes").deleteMany({});
    const subTypeResult = await db.collection("propertysubtypes").insertMany(subTypes);
    const subTypeIds = Object.values(subTypeResult.insertedIds);

    const amenities = [
      ["Swimming Pool", "recreation"], ["Club House", "recreation"], ["Gymnasium", "indoor"], ["Yoga Deck", "indoor"],
      ["Jogging Track", "outdoor"], ["Kids Play Area", "outdoor"], ["Landscaped Garden", "outdoor"], ["24x7 Security", "security"],
      ["CCTV Surveillance", "security"], ["Intercom", "security"], ["Power Backup", "utilities"], ["Water Supply", "utilities"],
      ["High-speed Elevators", "utilities"], ["Basement Parking", "utilities"], ["Rainwater Harvesting", "utilities"], ["EV Charging", "utilities"],
      ["Mini Theatre", "recreation"], ["Co-working Lounge", "indoor"], ["Multipurpose Hall", "indoor"], ["Indoor Games Room", "recreation"],
    ].map(([name, category]) => ({ name, category, icon: "✔", isActive: true, createdAt: now, updatedAt: now }));
    await db.collection("amenities").deleteMany({});
    const amenityResult = await db.collection("amenities").insertMany(amenities);
    const amenityIds = Object.values(amenityResult.insertedIds);

    const blogCategories = [
      { name: "Market Insights", slug: "market-insights", description: "Real estate market trends and city updates", isActive: true, createdAt: now, updatedAt: now },
      { name: "Buying Guides", slug: "buying-guides", description: "Property buying and due diligence guides", isActive: true, createdAt: now, updatedAt: now },
      { name: "Investment", slug: "investment", description: "Investment strategy and ROI-focused content", isActive: true, createdAt: now, updatedAt: now },
      { name: "Lifestyle", slug: "lifestyle", description: "Living experience, amenities, and neighborhood life", isActive: true, createdAt: now, updatedAt: now },
    ];
    await db.collection("blogcategories").deleteMany({});
    const blogCategoryResult = await db.collection("blogcategories").insertMany(blogCategories);
    const blogCategoryIds = Object.values(blogCategoryResult.insertedIds);

    await db.collection("properties").deleteMany({});
    const propertiesToInsert = propertySeed.map((p, idx) => {
      const minBed = minBedrooms(p.configuration);
      const maxBed = maxBedrooms(p.configuration);
      const primaryImage = randomFrom(imagePool, idx);
      const cityLower = p.city.toLowerCase();
      const state = cityLower.includes("mumbai") || cityLower.includes("pune") ? "Maharashtra"
        : cityLower.includes("bangalore") ? "Karnataka"
        : cityLower.includes("hyderabad") ? "Telangana"
        : cityLower.includes("gurgaon") ? "Haryana"
        : "Uttar Pradesh";

      const specFromConfig = `${p.configuration.join(" & ")} ${p.type || "apartments"}`.trim();

      return {
        title: p.name,
        slug: slugify(`${p.name}-${p.location}-${idx + 1}`, { lower: true, strict: true }),
        specification: specFromConfig,
        description: `<p><strong>${p.name}</strong> by ${p.developer} located at ${p.location}. This ${p.type} project offers ${p.configuration.join(", ")} residences.</p>`,
        price: priceToNumber(p.priceRange.min),
        priceType: "fixed",
        propertyType: propertyTypeIds[idx % propertyTypeIds.length],
        propertySubType: subTypeIds[idx % subTypeIds.length],
        status: "available",
        listingType: "sale",
        address: p.location,
        city: p.city,
        state,
        country: "India",
        pincode: "",
        bedrooms: minBed,
        bathrooms: Math.max(2, minBed),
        balconies: 1,
        floors: 10 + (idx % 30),
        totalFloors: 20 + (idx % 40),
        carpetArea: 1200 + (idx % 6) * 150,
        builtUpArea: 1500 + (idx % 6) * 180,
        superBuiltUpArea: 1800 + (idx % 6) * 220,
        areaUnit: "sqft",
        possessionStatus: p.status.toLowerCase().includes("under") ? "under-construction" : "ready",
        possessionDate: p.status.toLowerCase().includes("under") ? new Date("2027-12-31") : new Date("2024-12-31"),
        amenities: amenityIds.slice(0, 8 + (idx % 5)),
        features: [
          { label: "Developer", value: p.developer },
          { label: "Project Type", value: p.type },
          { label: "Configuration", value: p.configuration.join(", ") },
          { label: "Price Range", value: `${p.priceRange.min} - ${p.priceRange.max} INR` },
          { label: "Max Bedrooms", value: `${maxBed}` },
        ],
        images: [
          { url: primaryImage, alt: `${p.name} exterior`, isPrimary: true, order: 0 },
          { url: randomFrom(imagePool, idx + 1), alt: `${p.name} living area`, isPrimary: false, order: 1 },
          { url: randomFrom(imagePool, idx + 2), alt: `${p.name} amenities`, isPrimary: false, order: 2 },
        ],
        videoUrl: "",
        virtualTourUrl: "",
        documents: [],
        metaTitle: `${p.name} in ${p.city} | Price, Floor Plans & Details`,
        metaDescription: `${p.name} by ${p.developer} at ${p.location}. Explore ${p.configuration.join(", ")} options from ${p.priceRange.min}.`,
        metaKeywords: `${p.name}, ${p.city} property, ${p.developer}, luxury apartments`,
        isFeatured: !!p.featured,
        isNew: idx < 10,
        isPremium: !!p.featured,
        isActive: true,
        views: 100 + idx * 13,
        createdAt: now,
        updatedAt: now,
      };
    });
    const propertyResult = await db.collection("properties").insertMany(propertiesToInsert);
    const insertedPropertyIds = Object.values(propertyResult.insertedIds);

    await db.collection("blogs").deleteMany({});
    const blogsToInsert = Array.from({ length: 20 }).map((_, idx) => {
      const targetProject = propertySeed[idx % propertySeed.length];
      const catId = blogCategoryIds[idx % blogCategoryIds.length];
      const title = `Property Insight ${idx + 1}: ${targetProject.name} and ${targetProject.city} Market`;
      return {
        title,
        slug: slugify(title, { lower: true, strict: true }),
        content: `<p>${targetProject.name} in ${targetProject.location} is attracting attention due to ${targetProject.type} development style. Buyers looking for ${targetProject.configuration.join(", ")} are actively considering this micro-market.</p><p>Developer profile: ${targetProject.developer}. Current indicative range: ${targetProject.priceRange.min} to ${targetProject.priceRange.max}.</p>`,
        excerpt: `${targetProject.name} market snapshot with pricing and inventory trends in ${targetProject.city}.`,
        featuredImage: randomFrom(imagePool, idx + 3),
        category: catId,
        author: "Global Realty Research Team",
        authorAvatar: "",
        tags: [targetProject.city, targetProject.developer, "Real Estate", "Investment"],
        status: "published",
        publishedAt: new Date(Date.now() - idx * 86400000),
        metaTitle: `${targetProject.name} in ${targetProject.city} - Blog Analysis`,
        metaDescription: `Detailed analysis of ${targetProject.name} by ${targetProject.developer} in ${targetProject.city}.`,
        readTime: 5 + (idx % 6),
        views: 150 + idx * 17,
        createdAt: now,
        updatedAt: now,
      };
    });
    await db.collection("blogs").insertMany(blogsToInsert);

    await db.collection("newsletters").deleteMany({});
    const newsletterDocs = Array.from({ length: 20 }).map((_, idx) => ({
      email: `subscriber${idx + 1}@globalrealtymail.com`,
      isSubscribed: idx % 7 !== 0,
      subscribedAt: new Date(Date.now() - idx * 3600000),
      createdAt: now,
      updatedAt: now,
    }));
    await db.collection("newsletters").insertMany(newsletterDocs);

    await db.collection("inquiries").deleteMany({});
    const inquiryDocs = Array.from({ length: 20 }).map((_, idx) => {
      const propId = insertedPropertyIds[idx % insertedPropertyIds.length];
      const prop = propertiesToInsert[idx % propertiesToInsert.length];
      const statuses = ["new", "read", "replied"];
      return {
        name: `Lead User ${idx + 1}`,
        email: `lead${idx + 1}@mail.com`,
        phone: `+91${9000000000 + idx}`,
        message: `Hi, I am interested in ${prop.title}. Please share floor plans, payment schedule, and site visit slots.`,
        propertyId: new ObjectId(propId),
        propertyTitle: prop.title,
        status: statuses[idx % statuses.length],
        createdAt: now,
        updatedAt: now,
      };
    });
    await db.collection("inquiries").insertMany(inquiryDocs);

    const counts = {
      propertytypes: await db.collection("propertytypes").countDocuments(),
      propertysubtypes: await db.collection("propertysubtypes").countDocuments(),
      amenities: await db.collection("amenities").countDocuments(),
      blogcategories: await db.collection("blogcategories").countDocuments(),
      properties: await db.collection("properties").countDocuments(),
      blogs: await db.collection("blogs").countDocuments(),
      newsletters: await db.collection("newsletters").countDocuments(),
      inquiries: await db.collection("inquiries").countDocuments(),
    };

    console.log("✅ Bulk seed completed");
    console.table(counts);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

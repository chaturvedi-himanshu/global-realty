require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const now = new Date();

  // Seed Property Types
  const propTypesCount = await db.collection("propertytypes").countDocuments();
  if (propTypesCount === 0) {
    await db.collection("propertytypes").insertMany([
      { name: "Apartment", slug: "apartment", icon: "🏢", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "House", slug: "house", icon: "🏠", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Villa", slug: "villa", icon: "🏡", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Plot", slug: "plot", icon: "📐", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Commercial", slug: "commercial", icon: "🏗️", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Farm House", slug: "farm-house", icon: "🌿", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log("✓ Property types seeded");
  }
  const propTypes = await db.collection("propertytypes").find().toArray();
  const aptType = propTypes.find((t) => t.slug === "apartment") || propTypes[0];
  const houseType = propTypes.find((t) => t.slug === "house") || propTypes[1];
  const villaType = propTypes.find((t) => t.slug === "villa") || propTypes[2];

  // Seed Property Sub Types
  const subTypeCount = await db.collection("propertysubtypes").countDocuments();
  if (subTypeCount === 0) {
    await db.collection("propertysubtypes").insertMany([
      { name: "Studio Apartment", slug: "studio-apartment", propertyType: aptType?._id, isActive: true, createdAt: now, updatedAt: now },
      { name: "Penthouse", slug: "penthouse", propertyType: aptType?._id, isActive: true, createdAt: now, updatedAt: now },
      { name: "Independent House", slug: "independent-house", propertyType: houseType?._id, isActive: true, createdAt: now, updatedAt: now },
      { name: "Luxury Villa", slug: "luxury-villa", propertyType: villaType?._id, isActive: true, createdAt: now, updatedAt: now },
    ]);
    console.log("✓ Property sub types seeded");
  }
  const subTypes = await db.collection("propertysubtypes").find().toArray();

  // Seed Amenities
  const amenitiesCount = await db.collection("amenities").countDocuments();
  if (amenitiesCount === 0) {
    await db.collection("amenities").insertMany([
      { name: "Swimming Pool", icon: "🏊", category: "recreation", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Gym / Fitness Center", icon: "💪", category: "recreation", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "24x7 Security", icon: "🔒", category: "security", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "CCTV Surveillance", icon: "📹", category: "security", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Power Backup", icon: "⚡", category: "utilities", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Lift / Elevator", icon: "🛗", category: "indoor", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Parking", icon: "🚗", category: "outdoor", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Garden / Park", icon: "🌳", category: "outdoor", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Clubhouse", icon: "🏛️", category: "recreation", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Children Play Area", icon: "🛝", category: "outdoor", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Piped Gas", icon: "🔥", category: "utilities", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Water Supply 24x7", icon: "💧", category: "utilities", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Intercom Facility", icon: "📞", category: "security", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Rainwater Harvesting", icon: "🌧️", category: "utilities", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Solar Panels", icon: "☀️", category: "utilities", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log("✓ Amenities seeded");
  }
  const amenities = await db.collection("amenities").find().toArray();
  const amenityIds = amenities.slice(0, 8).map((a) => a._id);

  // Seed Blog Categories
  const blogCatsCount = await db.collection("blogcategories").countDocuments();
  if (blogCatsCount === 0) {
    await db.collection("blogcategories").insertMany([
      { name: "Real Estate Tips", slug: "real-estate-tips", description: "Expert tips for buying and selling", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Investment Guide", slug: "investment-guide", description: "Property investment insights", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Home Decor", slug: "home-decor", description: "Interior design and decoration ideas", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Market News", slug: "market-news", description: "Latest real estate market updates", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Legal Guide", slug: "legal-guide", description: "Property legal processes simplified", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log("✓ Blog categories seeded");
  }
  const blogCategories = await db.collection("blogcategories").find().toArray();

  // Seed Contact Info
  const contactCount = await db.collection("contactinfos").countDocuments();
  if (contactCount === 0) {
    await db.collection("contactinfos").insertOne({
      phones: ["+91 98765 43210", "+91 12345 67890"],
      emails: ["info@proty.com", "support@proty.com"],
      address: "123, Real Estate Plaza, MG Road, Bangalore - 560001",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.8865200097!2d77.49085290697655!3d12.953847500000019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890",
      workingHours: "Monday - Saturday: 9:00 AM - 7:00 PM",
      socialLinks: {
        facebook: "https://facebook.com/proty",
        instagram: "https://instagram.com/proty",
        linkedin: "https://linkedin.com/company/proty",
        youtube: "",
        twitter: "https://twitter.com/proty",
        whatsapp: "https://wa.me/919876543210",
      },
      createdAt: now,
      updatedAt: now,
    });
    console.log("✓ Contact info seeded");
  }

  // Seed Site Config
  const siteConfigCount = await db.collection("siteconfigs").countDocuments();
  if (siteConfigCount === 0) {
    await db.collection("siteconfigs").insertMany([
      { key: "siteName", value: "Proty Real Estate", label: "Site Name", type: "text", createdAt: new Date(), updatedAt: new Date() },
      { key: "siteTagline", value: "Find Your Dream Property", label: "Tagline", type: "text", createdAt: new Date(), updatedAt: new Date() },
      { key: "footerText", value: "© 2024 Proty Real Estate. All rights reserved.", label: "Footer Text", type: "text", createdAt: new Date(), updatedAt: new Date() },
      { key: "primaryColor", value: "#dc3545", label: "Primary Color", type: "text", createdAt: new Date(), updatedAt: new Date() },
      {
        key: "heroStats",
        value: [
          { label: "Years of Experience", value: 18, suffix: "+" },
          { label: "Happy Customers", value: 2500, suffix: "+" },
          { label: "Property Consultants", value: 75, suffix: "+" },
          { label: "Years Established", value: 2009, suffix: "" },
        ],
        label: "Hero Stats",
        type: "json",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log("✓ Site config seeded");
  }
  await db.collection("siteconfigs").updateOne(
    { key: "heroStats" },
    {
      $set: {
        key: "heroStats",
        value: [
          { label: "Years of Experience", value: 18, suffix: "+" },
          { label: "Happy Customers", value: 2500, suffix: "+" },
          { label: "Property Consultants", value: 75, suffix: "+" },
          { label: "Years Established", value: 2009, suffix: "" },
        ],
        label: "Hero Stats",
        type: "json",
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  console.log("✓ Hero stats config upserted");

  // Seed Hero Slides
  const heroCount = await db.collection("herosections").countDocuments();
  if (heroCount === 0) {
    await db.collection("herosections").insertMany([
      {
        title: "Discover Premium Properties",
        subtitle: "Curated homes, villas and apartments in top cities",
        backgroundImage: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1600",
        ctaText: "Explore Properties",
        ctaLink: "/properties",
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Your Dream Home Awaits",
        subtitle: "Trusted listings with verified details and instant inquiry",
        backgroundImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600",
        ctaText: "Schedule Visit",
        ctaLink: "/contact",
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    console.log("✓ Hero slides seeded");
  }

  // Seed About Section
  const aboutCount = await db.collection("aboutsections").countDocuments();
  if (aboutCount === 0) {
    await db.collection("aboutsections").insertOne({
      title: "Trusted Real Estate Platform",
      description:
        "Proty helps buyers, renters and investors find the right property with confidence through verified listings and expert support.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000",
      stats: [
        { label: "Properties Listed", value: "2500+" },
        { label: "Happy Clients", value: "1200+" },
        { label: "Cities Covered", value: "18" },
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✓ About section seeded");
  }

  // Seed Banners
  const bannerCount = await db.collection("banners").countDocuments();
  if (bannerCount === 0) {
    await db.collection("banners").insertMany([
      {
        title: "List your property with Proty",
        subtitle: "Reach thousands of serious buyers and renters",
        image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200",
        link: "/contact",
        position: "home",
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Get pre-approved for home loans",
        subtitle: "Fast process with partner banks",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200",
        link: "/contact",
        position: "sidebar",
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    console.log("✓ Banners seeded");
  }

  // Seed SEO Meta
  const seoCount = await db.collection("seometas").countDocuments();
  if (seoCount === 0) {
    await db.collection("seometas").insertMany([
      { page: "home", title: "Proty Real Estate | Buy Rent Sell Properties", description: "Explore verified properties for sale and rent across top cities.", keywords: "real estate, properties, apartments, villas", ogImage: "", createdAt: now, updatedAt: now },
      { page: "properties", title: "Propertiess | Proty", description: "Browse available homes, villas and apartments with filters.", keywords: "Propertiess, buy home, rent apartment", ogImage: "", createdAt: now, updatedAt: now },
      { page: "blog", title: "Real Estate Blog | Proty", description: "Guides, tips and market insights from experts.", keywords: "real estate blog, home buying tips, investment", ogImage: "", createdAt: now, updatedAt: now },
      { page: "contact", title: "Contact Proty Real Estate", description: "Get in touch with our support and sales team.", keywords: "contact real estate", ogImage: "", createdAt: now, updatedAt: now },
    ]);
    console.log("✓ SEO metadata seeded");
  }

  // Seed Testimonials
  const testimonialsCount = await db.collection("testimonials").countDocuments();
  if (testimonialsCount === 0) {
    await db.collection("testimonials").insertMany([
      { name: "Rajesh Kumar", role: "Home Buyer", company: "", message: "Proty made finding my dream home incredibly easy. The search filters are excellent and the team was very helpful throughout.", rating: 5, isApproved: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Priya Sharma", role: "Property Investor", company: "Sharma Holdings", message: "I've invested in 3 properties through Proty. Highly recommend for serious investors. Great listings and transparent process.", rating: 5, isApproved: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Amit Patel", role: "First-time Buyer", company: "", message: "As a first-time home buyer, I was nervous, but Proty's team guided me every step of the way. Found my perfect apartment!", rating: 4, isApproved: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log("✓ Testimonials seeded");
  }

  // Seed FAQs
  const faqsCount = await db.collection("faqs").countDocuments();
  if (faqsCount === 0) {
    await db.collection("faqs").insertMany([
      { question: "How do I search for properties?", answer: "Use our advanced search feature on the Properties page. You can filter by location, price range, property type, number of bedrooms, and many more criteria.", category: "general", order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { question: "Is it free to list a property?", answer: "We offer both free and premium listing options. Basic listings are free, while premium listings with featured placement and enhanced visibility are available at competitive rates.", category: "listing", order: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { question: "How do I contact a property seller?", answer: "On any property detail page, you'll find a contact form. Fill in your details and message, and the seller/agent will reach out to you directly.", category: "general", order: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { question: "Can I compare multiple properties?", answer: "Yes! You can compare up to 4 properties side-by-side using our comparison tool. Just click the Compare button on any Properties.", category: "features", order: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log("✓ FAQs seeded");
  }

  // Seed Sample Properties
  const propertiesCount = await db.collection("properties").countDocuments();
  if (propertiesCount === 0) {
    await db.collection("properties").insertMany([
      {
        title: "Luxury 3BHK Apartment in Koramangala",
        slug: "luxury-3bhk-apartment-koramangala",
        description: "<p>A beautiful luxury apartment in the heart of Koramangala. Features modern interiors, premium amenities and excellent connectivity.</p>",
        price: 9500000,
        priceType: "fixed",
        listingType: "sale",
        status: "available",
        propertyType: aptType?._id,
        propertySubType: subTypes.find((s) => s.slug === "penthouse")?._id,
        address: "5th Block, Koramangala",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        pincode: "560095",
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        builtUpArea: 1850,
        carpetArea: 1600,
        areaUnit: "sqft",
        possessionStatus: "ready",
        amenities: amenityIds,
        images: [
          { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", alt: "Front view", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", alt: "Living room", isPrimary: false, order: 1 },
          { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", alt: "Kitchen", isPrimary: false, order: 2 },
        ],
        isFeatured: true,
        isNew: true,
        isPremium: true,
        isActive: true,
        views: 0,
        features: [
          { label: "Carpet Area", value: "1600 sqft" },
          { label: "Floor", value: "7th of 12" },
          { label: "Age of Property", value: "New" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Spacious 4BHK Villa with Garden",
        slug: "spacious-4bhk-villa-whitefield",
        description: "<p>A stunning independent villa in Whitefield with a beautiful garden, private parking, and all modern amenities.</p>",
        price: 25000000,
        priceType: "fixed",
        listingType: "sale",
        status: "available",
        propertyType: houseType?._id,
        propertySubType: subTypes.find((s) => s.slug === "independent-house")?._id,
        address: "ITPL Main Road, Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        pincode: "560066",
        bedrooms: 4,
        bathrooms: 4,
        balconies: 3,
        builtUpArea: 3200,
        carpetArea: 2800,
        areaUnit: "sqft",
        possessionStatus: "ready",
        amenities: amenityIds,
        images: [
          { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", alt: "Villa exterior", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", alt: "Garden", isPrimary: false, order: 1 },
          { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800", alt: "Interior", isPrimary: false, order: 2 },
        ],
        isFeatured: true,
        isNew: false,
        isPremium: true,
        isActive: true,
        views: 0,
        features: [
          { label: "Plot Area", value: "2400 sqft" },
          { label: "Floors", value: "G+1" },
          { label: "Parking", value: "2 covered" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Modern 2BHK Flat for Rent in HSR Layout",
        slug: "modern-2bhk-flat-hsr-layout",
        description: "<p>Well-furnished 2BHK apartment available for rent in HSR Layout. Walking distance from tech parks and metro.</p>",
        price: 35000,
        priceType: "fixed",
        listingType: "rent",
        status: "available",
        propertyType: aptType?._id,
        propertySubType: subTypes.find((s) => s.slug === "studio-apartment")?._id,
        address: "HSR Layout Sector 7",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        pincode: "560102",
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        builtUpArea: 1100,
        carpetArea: 950,
        areaUnit: "sqft",
        possessionStatus: "ready",
        amenities: amenityIds.slice(0, 3),
        images: [
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", alt: "Apartment", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", alt: "Bedroom", isPrimary: false, order: 1 },
        ],
        isFeatured: false,
        isNew: true,
        isPremium: false,
        isActive: true,
        views: 0,
        features: [
          { label: "Furnishing", value: "Semi-furnished" },
          { label: "Floor", value: "3rd of 6" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log("✓ Sample properties seeded");
  }
  const properties = await db.collection("properties").find().toArray();

  // Seed Blogs
  const blogsCount = await db.collection("blogs").countDocuments();
  if (blogsCount === 0) {
    await db.collection("blogs").insertMany([
      {
        title: "How to Choose the Right Apartment in 2026",
        slug: "choose-right-apartment-2026",
        content: "<p>Finding the right apartment starts with budget, locality and long-term lifestyle planning...</p>",
        excerpt: "A practical checklist for selecting the right apartment in today's market.",
        featuredImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200",
        category: blogCategories[0]?._id,
        author: "Admin",
        tags: ["apartment", "buying-guide", "checklist"],
        status: "published",
        publishedAt: now,
        readTime: 6,
        views: 132,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Real Estate Investment Trends in India",
        slug: "real-estate-investment-trends-india",
        content: "<p>Investment opportunities in tier-1 and tier-2 markets are evolving rapidly...</p>",
        excerpt: "Key investment trends and what smart investors are watching this year.",
        featuredImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200",
        category: blogCategories[1]?._id,
        author: "Admin",
        tags: ["investment", "market", "india"],
        status: "published",
        publishedAt: now,
        readTime: 8,
        views: 221,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Home Decor Ideas for Modern Families",
        slug: "home-decor-ideas-modern-families",
        content: "<p>Designing a family-friendly home means balancing style with comfort...</p>",
        excerpt: "Simple decor upgrades that make your home modern and welcoming.",
        featuredImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
        category: blogCategories[2]?._id,
        author: "Admin",
        tags: ["decor", "interior", "family-home"],
        status: "published",
        publishedAt: now,
        readTime: 5,
        views: 98,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    console.log("✓ Blogs seeded");
  }

  // Seed Inquiries
  const inquiryCount = await db.collection("inquiries").countDocuments();
  if (inquiryCount === 0 && properties.length > 0) {
    await db.collection("inquiries").insertMany([
      {
        name: "Neha Gupta",
        email: "neha.gupta@example.com",
        phone: "+919900000001",
        message: "I want to schedule a visit this weekend.",
        propertyId: properties[0]?._id,
        propertyTitle: properties[0]?.title || "",
        status: "new",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Arjun Mehta",
        email: "arjun.mehta@example.com",
        phone: "+919900000002",
        message: "Can you share loan eligibility details?",
        propertyId: properties[1]?._id,
        propertyTitle: properties[1]?.title || "",
        status: "read",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Sonia Rao",
        email: "sonia.rao@example.com",
        phone: "+919900000003",
        message: "Is this property negotiable? Please call me.",
        propertyId: properties[2]?._id,
        propertyTitle: properties[2]?.title || "",
        status: "replied",
        createdAt: now,
        updatedAt: now,
      },
    ]);
    console.log("✓ Inquiries seeded");
  }

  // Seed Newsletter
  const newsletterCount = await db.collection("newsletters").countDocuments();
  if (newsletterCount === 0) {
    await db.collection("newsletters").insertMany([
      { email: "subscriber1@example.com", isSubscribed: true, subscribedAt: now, createdAt: now, updatedAt: now },
      { email: "subscriber2@example.com", isSubscribed: true, subscribedAt: now, createdAt: now, updatedAt: now },
      { email: "subscriber3@example.com", isSubscribed: true, subscribedAt: now, createdAt: now, updatedAt: now },
      { email: "subscriber4@example.com", isSubscribed: false, subscribedAt: now, createdAt: now, updatedAt: now },
    ]);
    console.log("✓ Newsletter subscribers seeded");
  }

  // Seed Property Reviews
  const reviewCount = await db.collection("propertyreviews").countDocuments();
  if (reviewCount === 0 && properties.length > 0) {
    await db.collection("propertyreviews").insertMany([
      {
        propertyId: properties[0]._id,
        name: "Kunal Verma",
        email: "kunal.verma@example.com",
        rating: 5,
        comment: "Excellent location and great construction quality.",
        isApproved: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        propertyId: properties[0]._id,
        name: "Pooja Nair",
        email: "pooja.nair@example.com",
        rating: 4,
        comment: "Nice amenities and pricing is reasonable.",
        isApproved: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        propertyId: properties[1]._id,
        name: "Ravi Shankar",
        email: "ravi.shankar@example.com",
        rating: 5,
        comment: "Perfect villa for families, peaceful surroundings.",
        isApproved: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    console.log("✓ Property reviews seeded");
  }

  // Seed Saved Properties
  const savedCount = await db.collection("savedproperties").countDocuments();
  if (savedCount === 0 && properties.length > 0) {
    await db.collection("savedproperties").insertMany([
      { sessionId: "demo-session-1", propertyId: properties[0]._id, createdAt: now, updatedAt: now },
      { sessionId: "demo-session-1", propertyId: properties[1]._id, createdAt: now, updatedAt: now },
      { sessionId: "demo-session-2", propertyId: properties[2]._id, createdAt: now, updatedAt: now },
    ]);
    console.log("✓ Saved properties seeded");
  }

  console.log("\n✅ Seed completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

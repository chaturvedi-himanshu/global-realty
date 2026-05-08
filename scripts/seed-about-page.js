require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date();

  const payload = {
    key: "main",
    heroBackgroundImage:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
    heroBadge: "39+ years of trusted advisory",
    heroTitle: "About Buniyad",
    heroSubtitle:
      "We are a full-service real estate advisory, helping families and investors discover homes and spaces that truly fit their lives.",
    heroQuote:
      "From the very first call, the team focused on understanding our needs rather than pushing a project. We felt supported at every step.",
    heroQuoteAuthor: "Arjun & Priya",
    heroStats: [
      { label: "Happy customers", value: "25k+", note: "" },
      { label: "Years experience", value: "39+", note: "" },
      { label: "Projects covered", value: "60k+", note: "" },
    ],
    heroPrimaryCtaText: "Our Journey",
    heroPrimaryCtaLink: "#about-journey",
    heroSecondaryCtaText: "Meet Our Team",
    heroSecondaryCtaLink: "#about-leadership",
    introEyebrow: "Trusted by families & investors",
    introTitle: "Real estate, done the right way.",
    introDescription:
      "From discovery to documentation, we stay with you at every step of your property journey.",
    introHighlights: [
      { label: "98% satisfaction", value: "", note: "Based on past closures" },
      { label: "NCR • Delhi • Noida", value: "", note: "Pan-India reach" },
    ],
    storyTitle: "Real Estate Built on Relationships",
    storyParagraphs: [
      "At Buniyad Realty, we believe real estate is not just about property - it is about people, trust, and long-term relationships.",
      "For over three decades, we have helped businesses and families find spaces that move them forward - backed by deep market expertise, transparent processes, and end-to-end advisory.",
      "Our commitment goes beyond transactions; we aim to be lifelong partners in your growth, guiding you with insights, integrity, and a genuine focus on what is right for you.",
    ],
    storyParagraph1:
      "At Buniyad Realty, we believe real estate is not just about property - it is about people, trust, and long-term relationships.",
    storyParagraph2:
      "For over three decades, we have helped businesses and families find spaces that move them forward - backed by deep market expertise, transparent processes, and end-to-end advisory.",
    storyParagraph3:
      "Our commitment goes beyond transactions; we aim to be lifelong partners in your growth, guiding you with insights, integrity, and a genuine focus on what is right for you.",
    leadershipEyebrow: "Legacy of trust",
    leadershipTitle: "Leadership Team",
    leadershipDescription:
      "At Buniyad Realty, leadership means more than titles - it is about vision, values, and accountability.",
    leaders: [
      {
        name: "Kamal Batra",
        role: "CMD",
        image:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80",
      },
      {
        name: "Abhi Batra",
        role: "Director",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
      },
      {
        name: "Ansh Batra",
        role: "Director",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80",
      },
    ],
    journeyEyebrow: "Our journey",
    journeyTitle: "Transforming an advisory desk into a trusted brand.",
    journeyDescription:
      "From a small advisory desk to a trusted brand - and now, a tech-enabled, values-driven movement.",
    journeyTimeline: [
      {
        year: "1987",
        title: "Founded with a vision to simplify property discovery.",
        description:
          "Buniyad Realty begins its journey, committed to making real estate transparent, trustworthy, and people-first.",
      },
      {
        year: "2000",
        title: "Expands across NCR with robust portfolios.",
        description:
          "We establish a strong presence in Delhi NCR, offering commercial, industrial, and residential solutions.",
      },
      {
        year: "2015",
        title: "Accelerates digital transformation.",
        description:
          "We integrate data-driven advisory, virtual tours, and smart shortlisting tools.",
      },
      {
        year: "2025",
        title: "39+ years of trust and excellence.",
        description:
          "Thousands of successful transactions later, our legacy continues with clarity, care, and customer-first values.",
      },
    ],
    valuesTitle: "Core Values",
    valuesDescription:
      "Our core values guide everything we do: integrity, transparency, customer-centricity, innovation, and sustainability.",
    values: [
      { title: "Integrity", description: "Doing the right thing - always." },
      { title: "Transparency", description: "Clear, open communication." },
      { title: "Customer-Centric", description: "Experiences designed around you." },
      { title: "Innovation", description: "Modern solutions and digital-first." },
      { title: "Sustainability", description: "Responsible growth and community impact." },
    ],
    missionEyebrow: "What drives us",
    missionTitle: "Mission & Vision",
    missionDescription:
      "Every conversation, every site visit, and every closure is guided by a single question: what is genuinely right for you?",
    missionHeading: "Our Mission",
    missionText:
      "To simplify real estate decisions for every buyer, seller, and investor by combining data-driven insight with human-first advisory.",
    visionHeading: "Our Vision",
    visionText:
      "To be India's most trusted real estate partner - the first name people think of for clarity, credibility, and comfort.",
    whyChooseEyebrow: "Why choose buniyad",
    whyChooseTitle: "More than listings. A complete experience.",
    whyChooseDescription:
      "We bring together verified inventory, real-time market understanding, and human-level support so every decision feels informed and secure.",
    whyChooseItems: [
      {
        title: "Verified properties only",
        description:
          "Every project is screened for approvals, background, and on-ground reality.",
        tagline: "No inflated promises, no hidden surprises.",
      },
      {
        title: "Advisors, not just agents",
        description:
          "Our team understands your needs first, then suggests properties.",
        tagline: "Your plan, not our inventory, leads the search.",
      },
      {
        title: "Transparent process & paperwork",
        description:
          "From site visits to signing, we keep every step documented and clear.",
        tagline: "Clarity at each milestone.",
      },
      {
        title: "Investment-ready insights",
        description:
          "For investors, we provide growth corridors, rental yields, and comparison analysis.",
        tagline: "Numbers that match the narrative.",
      },
      {
        title: "Dedicated after-sales support",
        description:
          "Our relationship does not end at booking; we continue support through possession.",
        tagline: "We stay reachable, not unreachable.",
      },
      {
        title: "Deep NCR understanding",
        description:
          "Ground-level insight across Delhi, Noida, Greater Noida, and Gurugram.",
        tagline: "Local insight, big-picture thinking.",
      },
    ],
    testimonialsEyebrow: "What our clients say",
    testimonialsTitle: "Stories from families & investors",
    testimonialsDescription:
      "The real measure of our work is the peace of mind our clients feel once they have made their decision.",
    testimonials: [
      {
        quote:
          "From the very first call, the team focused on understanding our needs rather than pushing a project. We felt supported at every step.",
        name: "Arjun & Priya",
        role: "First-time home buyers, Noida",
      },
      {
        quote:
          "Their analysis of different locations and returns helped us structure our portfolio across two cities with complete confidence.",
        name: "Vikram S.",
        role: "Investor, Delhi-NCR",
      },
      {
        quote:
          "The documentation support was a lifesaver. They explained every clause and kept us updated throughout.",
        name: "Kavita & Rajesh",
        role: "Upgrade buyers, Greater Noida",
      },
    ],
    ctaEyebrow: "Let's talk",
    ctaTitle: "Ready to explore your next property move?",
    ctaDescription:
      "Share your requirements and our advisory team will reach out with curated options - no spam, no pressure.",
    ctaButtonText: "Contact our team",
    ctaButtonLink: "/contact",
    footerCtaTitle: "Ready to find your Dream Property?",
    footerCtaDescription:
      "Let our experts guide you through every step of your real estate journey. From consultation to possession, we are with you all the way.",
    footerPrimaryButtonText: "View Properties",
    footerPrimaryButtonLink: "/properties",
    footerSecondaryButtonText: "Get in Touch",
    footerSecondaryButtonLink: "/contact",
    isActive: true,
    updatedAt: now,
  };

  await db.collection("aboutpages").updateOne(
    { key: "main" },
    { $set: payload, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );

  console.log("✓ About page seeded/updated");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

import mongoose from "mongoose";

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    value: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const PersonSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const TimelineItemSchema = new mongoose.Schema(
  {
    year: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const TextItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    tagline: { type: String, default: "" },
  },
  { _id: false },
);

const TestimonialSchema = new mongoose.Schema(
  {
    quote: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "" },
  },
  { _id: false },
);

const AboutPageSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main", index: true },
    heroBackgroundImage: { type: String, default: "" },
    heroBadge: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    heroQuote: { type: String, default: "" },
    heroQuoteAuthor: { type: String, default: "" },
    heroStats: { type: [StatSchema], default: [] },
    heroPrimaryCtaText: { type: String, default: "" },
    heroPrimaryCtaLink: { type: String, default: "" },
    heroSecondaryCtaText: { type: String, default: "" },
    heroSecondaryCtaLink: { type: String, default: "" },
    introEyebrow: { type: String, default: "" },
    introTitle: { type: String, default: "" },
    introDescription: { type: String, default: "" },
    introHighlights: { type: [StatSchema], default: [] },
    storyTitle: { type: String, default: "" },
    storyParagraphs: { type: [String], default: [] },
    storyParagraph1: { type: String, default: "" },
    storyParagraph2: { type: String, default: "" },
    storyParagraph3: { type: String, default: "" },
    leadershipEyebrow: { type: String, default: "" },
    leadershipTitle: { type: String, default: "" },
    leadershipDescription: { type: String, default: "" },
    leaders: { type: [PersonSchema], default: [] },
    journeyEyebrow: { type: String, default: "" },
    journeyTitle: { type: String, default: "" },
    journeyDescription: { type: String, default: "" },
    journeyTimeline: { type: [TimelineItemSchema], default: [] },
    valuesTitle: { type: String, default: "" },
    valuesDescription: { type: String, default: "" },
    values: { type: [TextItemSchema], default: [] },
    missionEyebrow: { type: String, default: "" },
    missionTitle: { type: String, default: "" },
    missionDescription: { type: String, default: "" },
    missionHeading: { type: String, default: "" },
    missionText: { type: String, default: "" },
    visionHeading: { type: String, default: "" },
    visionText: { type: String, default: "" },
    whyChooseEyebrow: { type: String, default: "" },
    whyChooseTitle: { type: String, default: "" },
    whyChooseDescription: { type: String, default: "" },
    whyChooseItems: { type: [TextItemSchema], default: [] },
    testimonialsEyebrow: { type: String, default: "" },
    testimonialsTitle: { type: String, default: "" },
    testimonialsDescription: { type: String, default: "" },
    testimonials: { type: [TestimonialSchema], default: [] },
    ctaEyebrow: { type: String, default: "" },
    ctaTitle: { type: String, default: "" },
    ctaDescription: { type: String, default: "" },
    ctaButtonText: { type: String, default: "" },
    ctaButtonLink: { type: String, default: "" },
    footerCtaTitle: { type: String, default: "" },
    footerCtaDescription: { type: String, default: "" },
    footerPrimaryButtonText: { type: String, default: "" },
    footerPrimaryButtonLink: { type: String, default: "" },
    footerSecondaryButtonText: { type: String, default: "" },
    footerSecondaryButtonLink: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.AboutPage ||
  mongoose.model("AboutPage", AboutPageSchema);

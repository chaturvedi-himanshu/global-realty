import mongoose from "mongoose";

const AboutSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Why Choose Our Properties" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    mediaLink: { type: String, default: "" },
    highlights: [{ type: String }],
    ctaText: { type: String, default: "Read More" },
    ctaLink: { type: String, default: "/about-us" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.AboutSection ||
  mongoose.model("AboutSection", AboutSectionSchema);

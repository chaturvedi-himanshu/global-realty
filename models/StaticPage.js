import mongoose from "mongoose";

const StaticPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    breadcrumbLabel: { type: String, default: "" },
    bannerHeading: { type: String, default: "" },
    bannerSubheading: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    bannerOverlayColor: { type: String, default: "rgba(15, 23, 42, 0.55)" },
    content: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

if (mongoose.models?.StaticPage) {
  delete mongoose.models.StaticPage;
}

export default mongoose.model("StaticPage", StaticPageSchema);

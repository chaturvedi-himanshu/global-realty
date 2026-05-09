import mongoose from "mongoose";
import "./BlogCategory";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
    },
    author: { type: String, default: "Admin" },
    authorAvatar: { type: String, default: "" },
    tags: [{ type: String }],
    trending: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    readTime: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogSchema.index({ title: "text", content: "text", excerpt: "text" });

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

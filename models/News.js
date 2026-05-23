import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    url: { type: String, required: true, trim: true },
    publishedDate: { type: Date, default: () => new Date() },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    order: { type: Number, default: 0 },
    source: { type: String, default: "" },
    isTopNews: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NewsSchema.index({ title: "text", description: "text" });

export default mongoose.models.News || mongoose.model("News", NewsSchema);

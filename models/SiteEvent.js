import mongoose from "mongoose";

const siteEventItemSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const siteEventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    items: { type: [siteEventItemSchema], default: [] },
  },
  { timestamps: true },
);

siteEventSchema.index({ slug: 1 }, { unique: true });
siteEventSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.SiteEvent ||
  mongoose.model("SiteEvent", siteEventSchema);

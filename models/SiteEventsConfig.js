import mongoose from "mongoose";

const siteEventsConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "site-events" },
    heading: { type: String, trim: true, default: "Discover our events" },
    subheading: {
      type: String,
      trim: true,
      default:
        "Photos and highlights from expos, launches, and community moments with Global Realty.",
    },
    bannerImage: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.SiteEventsConfig ||
  mongoose.model("SiteEventsConfig", siteEventsConfigSchema);

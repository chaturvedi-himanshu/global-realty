import mongoose from "mongoose";

const HomeAccordionPanelSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    tagline: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
    href: { type: String, default: "#", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.HomeAccordionPanel ||
  mongoose.model("HomeAccordionPanel", HomeAccordionPanelSchema);

import mongoose from "mongoose";

const HomeCtaBannerSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "home", index: true },
    heading: { type: String, default: "Let's Talk About Your Dream Property" },
    buttonText: { type: String, default: "Contact Us" },
    buttonLink: { type: String, default: "/contact" },
    backgroundImage: { type: String, default: "" },
    overlayColor: { type: String, default: "#0a141e" },
    overlayOpacity: { type: Number, default: 0.78, min: 0, max: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.HomeCtaBanner ||
  mongoose.model("HomeCtaBanner", HomeCtaBannerSchema);

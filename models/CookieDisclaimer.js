import mongoose from "mongoose";

const CookieDisclaimerSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "home", index: true },
    title: { type: String, default: "Your Privacy Matters" },
    paragraphs: { type: [String], default: [] },
    policyText: { type: String, default: "Privacy Policy" },
    policyUrl: { type: String, default: "/privacy-policy" },
    acceptText: { type: String, default: "Accept" },
    closeText: { type: String, default: "Close" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.CookieDisclaimer ||
  mongoose.model("CookieDisclaimer", CookieDisclaimerSchema);

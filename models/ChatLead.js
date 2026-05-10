import mongoose from "mongoose";

const chatLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    interestedIn: { type: String, required: true },
    phone: { type: String, required: true },
    query: { type: String, default: "" },
    source: { type: String, default: "website" },
  },
  { timestamps: true },
);

export default mongoose.models.ChatLead ||
  mongoose.model("ChatLead", chatLeadSchema);

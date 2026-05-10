import mongoose from "mongoose";

const chatbotQASchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    keywords: { type: [String], default: [] },
    isQuickReply: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.ChatbotQA ||
  mongoose.model("ChatbotQA", chatbotQASchema);

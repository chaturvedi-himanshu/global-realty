/**
 * Seed sample ChatbotQA documents (same shape as CHATBOT_FULL_REPLICATE_SPEC).
 * Requires MONGODB_URI in .env.local
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

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

const ChatbotQA =
  mongoose.models.ChatbotQA ||
  mongoose.model("ChatbotQA", chatbotQASchema);

const rows = [
  {
    question: "Browse properties",
    answer:
      "You can explore all listings from the **Properties** page. Use filters for city, type, and budget.",
    keywords: ["property", "listings", "browse", "search"],
    isQuickReply: true,
    order: 1,
  },
  {
    question: "Contact us",
    answer:
      "Visit our **Contact** page to send a message or call the number in the header. We usually respond within one business day.",
    keywords: ["contact", "email", "phone", "reach"],
    isQuickReply: true,
    order: 2,
  },
  {
    question: "RERA & documentation",
    answer:
      "RERA-registered projects show a badge on the listing. You can also ask for the RERA number on the property detail page before you shortlist.",
    keywords: ["rera", "registration", "legal", "documents"],
    isQuickReply: true,
    order: 3,
  },
  {
    question: "Schedule a visit",
    answer:
      "Use **Enquire** on the property or open the enquiry form from the footer. Share preferred dates and our team will coordinate a site visit.",
    keywords: ["visit", "site visit", "schedule", "tour"],
    isQuickReply: true,
    order: 4,
  },
  {
    question: "Pricing & payment plans",
    answer:
      "Each listing shows indicative pricing where available. For the latest offers and payment plans, request a callback — we will connect you with the right advisor.",
    keywords: ["price", "payment", "plan", "cost", "budget"],
    isQuickReply: false,
    order: 5,
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const existing = await ChatbotQA.countDocuments();
  if (existing > 0) {
    console.log(`ChatbotQA already has ${existing} document(s). Skipping seed (delete collection to re-seed).`);
    await mongoose.disconnect();
    process.exit(0);
  }
  await ChatbotQA.insertMany(rows);
  console.log(`Inserted ${rows.length} ChatbotQA documents.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

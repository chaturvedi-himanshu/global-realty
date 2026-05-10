import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ChatbotQA from "@/models/ChatbotQA";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const faqs = await ChatbotQA.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: faqs });
  } catch {
    return NextResponse.json({ success: false, data: [] });
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ChatLead from "@/models/ChatLead";
import { assertLeadPayload } from "@/lib/chatbotLeadValidation";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = assertLeadPayload(body || {});
    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status },
      );
    }
    await connectDB();
    await ChatLead.create(parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

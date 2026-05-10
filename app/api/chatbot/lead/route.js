import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ChatLead from "@/models/ChatLead";
import { assertLeadPayload } from "@/lib/chatbotLeadValidation";
import { sendLeadToCrm } from "@/lib/crmLead";

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
    await sendLeadToCrm({
      name: parsed.data.name,
      email: parsed.data.email,
      mobile: parsed.data.phone,
      formType: "Chatbot Lead",
      source: parsed.data.source || "chatbot",
      remark: [
        "Lead from Chatbot Form",
        parsed.data.interestedIn
          ? `Interest: ${parsed.data.interestedIn}`
          : "",
        parsed.data.query ? `Query: ${String(parsed.data.query).slice(0, 220)}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

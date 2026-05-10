import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ChatLead from "@/models/ChatLead";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, query, source } = body || {};
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone required" },
        { status: 400 },
      );
    }
    await connectDB();
    await ChatLead.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      query: query != null ? String(query) : "",
      source: source === "admin" ? "admin" : "website",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

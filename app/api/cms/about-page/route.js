import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import AboutPage from "@/models/AboutPage";
import { mergeAboutPage } from "@/lib/aboutPageDefaults";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("raw");
    const doc = await AboutPage.findOne({ key: "main" }).lean();
    if (raw === "true") {
      return NextResponse.json({ success: true, data: doc || null });
    }
    return NextResponse.json({ success: true, data: mergeAboutPage(doc), raw: doc });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const doc = await AboutPage.findOneAndUpdate(
      { key: "main" },
      { ...body, key: "main" },
      { new: true, upsert: true },
    );
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

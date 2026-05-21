import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import StaticPage from "@/models/StaticPage";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const query = String(slug).match(/^[0-9a-fA-F]{24}$/)
      ? { _id: slug }
      : { slug: String(slug).toLowerCase() };
    const item = await StaticPage.findOne(query).lean();
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

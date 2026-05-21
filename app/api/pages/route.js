import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import StaticPage from "@/models/StaticPage";
import { generateSlug } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const query = all ? {} : { status: "published" };

    const [items, total] = await Promise.all([
      StaticPage.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content")
        .lean(),
      StaticPage.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }
    if (!body.slug) body.slug = generateSlug(body.title);
    body.slug = String(body.slug).trim().toLowerCase();
    const existing = await StaticPage.findOne({ slug: body.slug });
    if (existing) body.slug = `${body.slug}-${Date.now()}`;
    const item = await StaticPage.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

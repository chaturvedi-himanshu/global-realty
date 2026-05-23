import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import News from "@/models/News";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const all = searchParams.get("all");

    const query = all ? {} : { status: "published" };

    const keyword = searchParams.get("keyword") || searchParams.get("q");
    if (keyword) query.$text = { $search: keyword };

    if (searchParams.get("topNews") === "true") {
      query.isTopNews = true;
    }

    const [items, total] = await Promise.all([
      News.find(query)
        .sort({ publishedDate: -1, order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments(query),
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
    if (!body.title || !body.url) {
      return NextResponse.json(
        { success: false, error: "Title and URL are required" },
        { status: 400 },
      );
    }
    const item = await News.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

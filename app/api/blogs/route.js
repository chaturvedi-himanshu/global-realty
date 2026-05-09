import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Blog from "@/models/Blog";
import BlogCategory from "@/models/BlogCategory";
import mongoose from "mongoose";
import { generateSlug } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;
    const all = searchParams.get("all");

    const query = all ? {} : { status: "published" };

    const keyword = searchParams.get("keyword") || searchParams.get("q");
    if (keyword) query.$text = { $search: keyword };

    const category = searchParams.get("category");
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        query.category = category;
      } else {
        const cat = await BlogCategory.findOne({ slug: category, isActive: true })
          .select("_id")
          .lean();
        // If category slug not found, force empty result
        query.category = cat?._id || new mongoose.Types.ObjectId();
      }
    }

    const tag = searchParams.get("tag");
    if (tag) query.tags = tag;

    const trending = searchParams.get("trending");
    if (trending === "true") query.trending = true;
    if (trending === "false") query.trending = { $ne: true };

    const exclude = searchParams.get("exclude");
    if (exclude) {
      const ids = exclude
        .split(",")
        .map((x) => x.trim())
        .filter((x) => mongoose.isValidObjectId(x))
        .map((x) => new mongoose.Types.ObjectId(x));
      if (ids.length) query._id = { $nin: ids };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("category", "name slug")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content")
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.slug) body.slug = generateSlug(body.title || "blog");
    const existing = await Blog.findOne({ slug: body.slug });
    if (existing) body.slug = `${body.slug}-${Date.now()}`;
    if (body.status === "published" && !body.publishedAt) {
      body.publishedAt = new Date();
    }
    const blog = await Blog.create(body);
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

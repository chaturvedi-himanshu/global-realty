import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";
import Blog from "@/models/Blog";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, data: { properties: [], blogs: [] } });
    }

    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = { $regex: esc, $options: "i" };

    const [properties, blogs] = await Promise.all([
      Property.find({
        isActive: true,
        $or: [
          { title: regex },
          { address: regex },
          { specification: regex },
          { description: regex },
          { tags: regex },
          { city: regex },
        ],
      })
        .limit(5)
        .select("title slug city price images listingType")
        .lean(),
      Blog.find({
        status: "published",
        $or: [{ title: regex }, { excerpt: regex }],
      })
        .limit(5)
        .select("title slug featuredImage publishedAt")
        .lean(),
    ]);

    return NextResponse.json({ success: true, data: { properties, blogs } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

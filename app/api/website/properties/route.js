import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "12");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const query = { isActive: { $ne: false } };
    if (featured === "true") query.featured = true;
    if (type) query.type = type;
    if (status) query.status = status;

    const properties = await Property.aggregate([
      { $match: query },
      {
        $addFields: {
          _ord: {
            $cond: [
              { $gt: [{ $ifNull: ["$displayOrder", 0] }, 0] },
              "$displayOrder",
              Number.MAX_SAFE_INTEGER,
            ],
          },
        },
      },
      { $sort: { _ord: 1, createdAt: -1 } },
      { $limit: limit },
      { $project: { __v: 0, _ord: 0 } },
    ]);

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

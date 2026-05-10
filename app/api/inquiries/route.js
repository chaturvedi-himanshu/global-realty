import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import { sendLeadToCrm } from "@/lib/crmLead";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const query = status ? { status } : {};

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate("propertyId", "title slug images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: inquiries,
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
    let resolvedProjectName =
      String(body?.projectName || "").trim() ||
      String(body?.propertyTitle || "").trim();

    if (!resolvedProjectName && body?.propertyId) {
      try {
        const property = await Property.findById(body.propertyId)
          .select("title")
          .lean();
        resolvedProjectName = String(property?.title || "").trim();
      } catch {
        // Ignore lookup failure and keep fallback behavior.
      }
    }

    const inquiry = await Inquiry.create({
      ...body,
      projectName: resolvedProjectName || body?.projectName || "",
      propertyTitle:
        String(body?.propertyTitle || "").trim() || resolvedProjectName || "",
    });
    await sendLeadToCrm({
      name: body?.name,
      email: body?.email,
      mobile: body?.phone,
      formType: body?.pageName || "Inquiry",
      projectName: resolvedProjectName,
      source: "website",
      remark: [
        `Lead from ${body?.pageName || "Inquiry"} Form`,
        body?.interest ? `Interest: ${body.interest}` : "",
        body?.message ? `Message: ${String(body.message).slice(0, 220)}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    });
    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

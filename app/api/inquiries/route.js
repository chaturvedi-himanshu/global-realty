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

    const allowedTypes = new Set([
      "agent_connect",
      "site_visit",
      "book_meeting",
      "brochure_download",
    ]);
    const rawInquiryType = String(body?.inquiryType || "").trim();
    const inquiryType = allowedTypes.has(rawInquiryType)
      ? rawInquiryType
      : "book_meeting";

    let visitDate = null;
    if (inquiryType === "site_visit" && body?.visitDate) {
      const parsed = new Date(body.visitDate);
      if (!Number.isNaN(parsed.getTime())) {
        visitDate = parsed;
      }
    }

    let meetingDateTime = null;
    if (inquiryType === "book_meeting" && body?.meetingDateTime) {
      const parsed = new Date(body.meetingDateTime);
      if (!Number.isNaN(parsed.getTime())) {
        meetingDateTime = parsed;
      }
    }

    const inquiry = await Inquiry.create({
      ...body,
      inquiryType,
      visitDate,
      meetingDateTime,
      projectName: resolvedProjectName || body?.projectName || "",
      propertyTitle:
        String(body?.propertyTitle || "").trim() || resolvedProjectName || "",
    });

    const TYPE_LABELS = {
      book_meeting: "Connect with an Expert",
      site_visit: "Book a Site Visit",
      agent_connect: "Connect with an Agent",
      brochure_download: "Brochure / File Download",
    };
    const inquiryTypeLabel = TYPE_LABELS[inquiryType] || "Inquiry";
    const visitDateLabel = visitDate
      ? visitDate.toISOString().slice(0, 10)
      : "";
    const meetingDateTimeLabel = meetingDateTime
      ? meetingDateTime.toISOString().replace("T", " ").slice(0, 16)
      : "";

    await sendLeadToCrm({
      name: body?.name,
      email: body?.email,
      mobile: body?.phone,
      formType: inquiryTypeLabel,
      projectName: resolvedProjectName,
      source: "website",
      remark: [
        `Lead from ${body?.pageName || "Inquiry"} Form`,
        `Type: ${inquiryTypeLabel}`,
        visitDateLabel ? `Visit Date: ${visitDateLabel}` : "",
        meetingDateTimeLabel ? `Meeting: ${meetingDateTimeLabel}` : "",
        body?.interest ? `Interest: ${body.interest}` : "",
        body?.message ? `Message: ${String(body.message).slice(0, 220)}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    });
    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/inquiries failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 },
    );
  }
}

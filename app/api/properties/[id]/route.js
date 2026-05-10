import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";
import "@/models/City";
import "@/models/State";
import "@/models/Country";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { slug: id };

    const property = await Property.findOne({ ...query, isActive: { $ne: false } })
      .populate("propertyType", "name slug icon")
      .populate("propertySubType", "name slug")
      .populate("amenities", "name icon category")
      .populate({
        path: "city",
        select: "name slug state",
        populate: { path: "state", select: "name code" },
      })
      .populate("state", "name code")
      .populate("country", "name code")
      .lean();

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    await Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } });

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const property = await Property.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    await Property.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ success: true, message: "Property deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import News from "@/models/News";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await News.findById(id).lean();
    if (!item) {
      return NextResponse.json(
        { success: false, error: "News not found" },
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

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const item = await News.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "News deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

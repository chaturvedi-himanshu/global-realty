import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import HeroSection from "@/models/HeroSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const filter = all ? {} : { isActive: true };
    const slides = await HeroSection.find(filter).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const slide = await HeroSection.create(body);
    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

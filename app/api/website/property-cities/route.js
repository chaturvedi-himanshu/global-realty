import { NextResponse } from "next/server";
import { getListedCityNames } from "@/lib/getListedCityNames";

/** Distinct city names from active listings (for search filters). */
export async function GET() {
  try {
    const names = await getListedCityNames();
    return NextResponse.json({ success: true, data: names });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

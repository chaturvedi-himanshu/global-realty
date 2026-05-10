import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";
import "@/models/City";
import { PROPERTY_LISTED_QUERY } from "@/lib/propertyCityLabels";
import { getListedCityNames } from "@/lib/getListedCityNames";
import {
  matchCityInMessage,
  parseBedroomsAndListingType,
  buildSpecificationWordMatchClause,
} from "@/lib/parseChatPropertyIntent";
import { formatPropertyPriceCrLac } from "@/lib/formatPropertyPriceIN";

export const dynamic = "force-dynamic";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function buildCityFilter(cityName) {
  const CityModel =
    mongoose.models.City ||
    mongoose.model(
      "City",
      new mongoose.Schema({ name: String, slug: String }, { strict: false }),
    );
  const cityDoc = await CityModel.findOne({
    name: { $regex: `^${escapeRegExp(cityName.trim())}$`, $options: "i" },
  })
    .select("_id")
    .lean();

  if (cityDoc?._id) {
    return {
      $or: [
        { city: cityDoc._id },
        { city: { $regex: escapeRegExp(cityName.trim()), $options: "i" } },
      ],
    };
  }
  return { city: { $regex: escapeRegExp(cityName.trim()), $options: "i" } };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "").trim();
    if (!q) {
      return NextResponse.json({ success: true, matched: false });
    }

    const cityNames = await getListedCityNames();
    const matchedCity = matchCityInMessage(q, cityNames);
    const { bedrooms, listingType } = parseBedroomsAndListingType(q);
    const specClause = buildSpecificationWordMatchClause(q, matchedCity);

    const hasIntent =
      matchedCity != null || bedrooms != null || specClause != null;
    if (!hasIntent) {
      return NextResponse.json({ success: true, matched: false });
    }

    await connectDB();

    const andParts = [{ ...PROPERTY_LISTED_QUERY }];

    if (bedrooms !== null) {
      andParts.push({ bedrooms });
    }

    if (matchedCity) {
      andParts.push(await buildCityFilter(matchedCity));
    }

    if (listingType === "rent") {
      andParts.push({ listingType: { $in: ["rent", "lease", "both"] } });
    } else if (listingType === "sale") {
      andParts.push({ listingType: { $in: ["sale", "both"] } });
    }

    if (specClause) {
      andParts.push(specClause);
    }

    const query = andParts.length === 1 ? andParts[0] : { $and: andParts };

    const sort = { isFeatured: -1, createdAt: -1 };

    const rows = await Property.find(query)
      .populate({
        path: "city",
        select: "name slug",
      })
      .sort(sort)
      .limit(5)
      .lean();

    const params = new URLSearchParams();
    if (matchedCity) params.set("city", matchedCity);
    if (bedrooms !== null) params.set("beds", String(bedrooms));
    if (listingType) params.set("listingType", listingType);
    const moreUrl = `/properties${params.toString() ? `?${params.toString()}` : ""}`;

    const data = rows.map((p) => ({
      slug: p.slug || String(p._id),
      title: p.title || "Listing",
      priceDisplay: formatPropertyPriceCrLac(
        p.price,
        p.priceType,
        p.currency || "INR",
      ),
      specification: String(p.specification || "").trim() || "—",
    }));

    return NextResponse.json({
      success: true,
      matched: true,
      intent: {
        city: matchedCity,
        bedrooms,
        listingType,
      },
      data,
      moreUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, matched: false, error: error.message },
      { status: 500 },
    );
  }
}

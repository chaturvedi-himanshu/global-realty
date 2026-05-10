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
} from "@/lib/parseChatPropertyIntent";

export const dynamic = "force-dynamic";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function thumbFromProperty(p) {
  const images = p?.images;
  if (!Array.isArray(images) || images.length === 0) return "";
  const primary = images.find((i) => i && typeof i === "object" && i.isPrimary);
  const first = primary || images[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && first.url) return first.url;
  return "";
}

function cityLabelFromPopulated(p) {
  if (p?.city && typeof p.city === "object" && p.city.name)
    return String(p.city.name).trim();
  return "";
}

function formatPriceLine(p) {
  if (p?.priceType === "on-request") return "Price on request";
  const n = Number(p?.price || 0);
  if (!n) return "Price on request";
  return `₹${n.toLocaleString("en-IN")}`;
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

    if (matchedCity == null && bedrooms == null) {
      return NextResponse.json({ success: true, matched: false });
    }

    await connectDB();

    const query = { ...PROPERTY_LISTED_QUERY };

    if (bedrooms !== null) {
      query.bedrooms = bedrooms;
    }

    if (matchedCity) {
      const cityQ = await buildCityFilter(matchedCity);
      Object.assign(query, cityQ);
    }

    if (listingType === "rent") {
      query.listingType = { $in: ["rent", "lease", "both"] };
    } else if (listingType === "sale") {
      query.listingType = { $in: ["sale", "both"] };
    }

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
      _id: String(p._id),
      title: p.title || "Listing",
      slug: p.slug || String(p._id),
      price: p.price,
      priceType: p.priceType,
      bedrooms: p.bedrooms,
      builtUpArea: p.builtUpArea,
      areaUnit: p.areaUnit || "sqft",
      cityLabel: cityLabelFromPopulated(p),
      image: thumbFromProperty(p),
      priceLine: formatPriceLine(p),
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

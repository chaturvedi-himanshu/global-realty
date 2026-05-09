import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Breadcumb from "@/components/common/Breadcumb";
import Cta from "@/components/common/Cta";
import Details1 from "@/components/propertyDetails/Details1";
import RelatedProperties from "@/components/propertyDetails/RelatedProperties";
import Slider1 from "@/components/propertyDetails/sliders/Slider1";
import React from "react";
import connectDB from "@/lib/mongoose";
import Property from "@/models/Property";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

function objectIdFromBufferObject(value) {
  if (
    value &&
    typeof value === "object" &&
    Array.isArray(value.buffer) &&
    value.buffer.length === 12
  ) {
    try {
      return Buffer.from(value.buffer).toString("hex");
    } catch {
      return "";
    }
  }
  return "";
}

function toPlainValue(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => toPlainValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if (
      value._bsontype === "ObjectId" &&
      typeof value.toString === "function"
    ) {
      return value.toString();
    }

    const asIdFromBuffer = objectIdFromBufferObject(value);
    if (asIdFromBuffer) return asIdFromBuffer;

    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toPlainValue(v);
    }
    return out;
  }

  return value;
}

function toObjectIdString(value) {
  if (!value) return "";
  if (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)) return value;
  if (value?._bsontype === "ObjectId" && typeof value.toString === "function") {
    return value.toString();
  }
  const fromBuffer = objectIdFromBufferObject(value);
  return /^[a-f\d]{24}$/i.test(fromBuffer) ? fromBuffer : "";
}

async function resolveLocationRef(value, collectionName) {
  if (!value) return "";
  if (typeof value === "object" && value.name) return value;
  if (typeof value === "string" && !/^[a-f\d]{24}$/i.test(value)) return value;

  const id = toObjectIdString(value);
  if (!id) return "";

  try {
    const doc = await mongoose.connection
      .collection(collectionName)
      .findOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { projection: { name: 1 } },
      );
    if (doc?.name) return { _id: id, name: doc.name };
  } catch {
    // keep fallback below
  }
  return id;
}

async function fetchProperty(id) {
  await connectDB();
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isMongoId
    ? { _id: id, isActive: { $ne: false } }
    : { slug: id, isActive: { $ne: false } };

  const property = await Property.findOne(query)
    .populate("propertyType", "name slug icon")
    .populate("propertySubType", "name slug")
    .populate("amenities", "name icon category")
    .populate("agentId", "name email phone avatar")
    .lean();

  if (!property) return null;

  // Fetch extra fields the schema may not expose via raw collection
  // (nearby, floorPlans, reviews, agent, loanDefaults, etc.)
  const rawDoc = await mongoose.connection
    .collection("properties")
    .findOne(
      { _id: new mongoose.Types.ObjectId(property._id.toString()) },
      {
        projection: {
          nearby: 1,
          floorPlans: 1,
          agent: 1,
          loanDefaults: 1,
          reviews: 1,
          overviewData: 1,
          overviewContent: 1,
        },
      }
    );

  const city = await resolveLocationRef(property.city, "cities");
  const state = await resolveLocationRef(property.state, "states");
  const country = await resolveLocationRef(property.country, "countries");

  const normalized = {
    ...property,
    _id: property._id.toString(),
    // Merge raw fields that the ORM model might miss due to schema cache
    nearby:      rawDoc?.nearby      ?? property.nearby      ?? [],
    floorPlans:  rawDoc?.floorPlans  ?? property.floorPlans  ?? [],
    reviews:     rawDoc?.reviews     ?? property.reviews     ?? [],
    agent:       rawDoc?.agent       ?? property.agent       ?? {},
    loanDefaults: rawDoc?.loanDefaults ?? property.loanDefaults ?? {},
    overviewData: rawDoc?.overviewData ?? property.overviewData ?? [],
    overviewContent:
      rawDoc?.overviewContent ?? property.overviewContent ?? "",
    city,
    state,
    country,
    propertyType: property.propertyType
      ? { ...property.propertyType, _id: property.propertyType._id?.toString() }
      : null,
    propertySubType: property.propertySubType
      ? {
          ...property.propertySubType,
          _id: property.propertySubType._id?.toString(),
        }
      : null,
    amenities: (property.amenities || []).map((a) => ({
      ...a,
      _id: a._id?.toString(),
    })),
    agentId: property.agentId
      ? { ...property.agentId, _id: property.agentId._id?.toString() }
      : null,
  };

  return toPlainValue(normalized);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const property = await fetchProperty(id);
    if (!property) return { title: "Property Not Found | Proty Real Estate" };
    return {
      title: property.metaTitle || `${property.title} | Proty Real Estate`,
      description:
        property.metaDescription ||
        property.excerpt ||
        `${property.title} in ${typeof property.city === "object" ? property.city?.name || "" : property.city || ""}`,
    };
  } catch {
    return { title: "Property Details | Proty Real Estate" };
  }
}

export default async function page({ params }) {
  const { id } = await params;

  let property = null;
  try {
    property = await fetchProperty(id);
  } catch (error) {
    console.error("Error fetching property:", error);
  }

  if (!property) {
    notFound();
  }
  if (property.slug && id !== property.slug) {
    redirect(`/property-detail/${property.slug}`);
  }

  return (
    <>
      <div id="wrapper">
        <Header1 />
        <Breadcumb pageName={property.title} />
        <div className="main-content">
          <div id="property-detail-print-area">
            <Slider1 images={property.images} title={property.title} />
            <Details1 property={property} />
            <RelatedProperties
              city={property.city}
              propertySubType={property.propertySubType}
              currentId={property._id}
            />
          </div>
          <Cta />
        </div>
        <Footer1 />
      </div>
    </>
  );
}

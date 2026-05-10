import mongoose from "mongoose";
import "./PropertyType";
import "./PropertySubType";
import "./Amenity";

// ── Sub-schemas ─────────────────────────────────────────────────────────────

const AttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    url: { type: String, default: "" },
    fileType: { type: String, default: "pdf" },
  },
  { _id: false },
);

const FloorPlanSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Floor Plan" },
    image: { type: String, default: "" },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
  },
  { _id: false },
);

const NearbyPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    distance: { type: String, default: "" },
  },
  { _id: false },
);

const NearbySchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    icon: { type: String, default: "" },
    places: { type: [NearbyPlaceSchema], default: [] },
  },
  { _id: false },
);

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    avatar: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    review: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AgentSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { _id: false },
);

const LoanDefaultsSchema = new mongoose.Schema(
  {
    downPaymentPercent: { type: Number, default: 20 },
    interestRate: { type: Number, default: 8 },
    amortizationMonths: { type: Number, default: 240 },
    propertyTaxMonthly: { type: Number, default: 0 },
    homeInsuranceMonthly: { type: Number, default: 0 },
  },
  { _id: false },
);

const OverviewItemSchema = new mongoose.Schema(
  {
    key: { type: String, default: "", trim: true },
    value: { type: String, default: "", trim: true },
    icon: { type: String, default: "", trim: true }, // react-icons key, e.g. FiHome
  },
  { _id: false },
);

const PriceListItemSchema = new mongoose.Schema(
  {
    property: { type: String, default: "", trim: true },
    inventory: { type: String, default: "", trim: true },
    size: { type: String, default: "", trim: true },
    price: { type: String, default: "", trim: true },
  },
  { _id: false },
);

// ── Main schema ─────────────────────────────────────────────────────────────

const PropertySchema = new mongoose.Schema(
  {
    // ── Identification ──────────────────────────
    propertyId: { type: String, default: "" },
    reraNumber: { type: String, default: "", trim: true },
    /** e.g. "2 BHK & 3 BHK apartments" — shown on cards & detail; used in search / chatbot. */
    specification: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },

    // ── Pricing ─────────────────────────────────
    price: { type: Number, default: 0 },
    priceType: {
      type: String,
      enum: [
        "fixed",
        "negotiable",
        "on-request",
        "total",
        "monthly",
        "yearly",
        "per_sqft",
      ],
      default: "fixed",
    },
    currency: { type: String, default: "INR" },

    // ── Classification ───────────────────────────
    status: {
      type: String,
      enum: ["available", "sold", "rented", "upcoming"],
      default: "available",
    },
    listingType: {
      type: String,
      enum: ["sale", "rent", "both", "lease"],
      default: "sale",
    },
    label: { type: String, default: "" },
    propertyType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyType",
      default: null,
    },
    propertySubType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertySubType",
      default: null,
    },

    // ── Media ────────────────────────────────────
    // Supports both [{url, alt, isPrimary, order}] and [String] from admin
    images: { type: mongoose.Schema.Types.Mixed, default: [] },
    // Both field names used by different versions
    videoUrl: { type: String, default: "" },
    video: { type: String, default: "" },
    virtualTourUrl: { type: String, default: "" },
    virtualTour: { type: String, default: "" },
    attachments: { type: [AttachmentSchema], default: [] },

    // ── Location ─────────────────────────────────
    address: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: mongoose.Schema.Types.Mixed, default: null },
    state: { type: mongoose.Schema.Types.Mixed, default: null },
    country: { type: mongoose.Schema.Types.Mixed, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    mapEmbedUrl: { type: String, default: "" },

    // ── Specs ────────────────────────────────────
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    balconies: { type: Number, default: 0 },
    garages: { type: Number, default: 0 },
    garageSize: { type: Number, default: 0 },
    totalSize: { type: Number, default: 0 },
    landSize: { type: Number, default: 0 },
    builtUpArea: { type: Number, default: 0 },
    superBuiltUpArea: { type: Number, default: 0 },
    carpetArea: { type: Number, default: 0 },
    areaUnit: {
      type: String,
      enum: ["sqft", "sqm", "yards"],
      default: "sqft",
    },
    yearBuilt: { type: Number, default: null },
    rooms: { type: Number, default: 0 },
    floorNumber: { type: Number, default: null },
    floors: { type: Number, default: 0 },
    totalFloors: { type: Number, default: null },
    furnishingStatus: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished", ""],
      default: "unfurnished",
    },
    facing: {
      type: String,
      enum: [
        "East",
        "West",
        "North",
        "South",
        "North-East",
        "North-West",
        "South-East",
        "South-West",
        "",
      ],
      default: "",
    },
    parkingType: {
      type: String,
      enum: ["covered", "open", "none"],
      default: "none",
    },
    possessionStatus: {
      type: String,
      enum: ["ready", "under-construction", ""],
      default: "ready",
    },
    possessionDate: { type: Date, default: null },
    availableFrom: { type: Date, default: null },
    propertyAge: { type: Number, default: null },

    // ── Amenities & Features ─────────────────────
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Amenity" }],
    features: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    // ── Floor Plans ──────────────────────────────
    floorPlans: { type: [FloorPlanSchema], default: [] },

    // ── Nearby ───────────────────────────────────
    nearby: { type: [NearbySchema], default: [] },

    // ── Reviews ──────────────────────────────────
    reviews: { type: [ReviewSchema], default: [] },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // ── Loan Calculator defaults ─────────────────
    loanDefaults: { type: LoanDefaultsSchema, default: () => ({}) },
    overviewData: { type: [OverviewItemSchema], default: [] },
    overviewContent: { type: String, default: "" },
    priceList: { type: [PriceListItemSchema], default: [] },

    // ── Agent / Seller ─────────────────────────── (embedded; agentId is ref)
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    agent: { type: AgentSchema, default: () => ({}) },

    // ── Discovery ────────────────────────────────
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },

    // ── Flags ────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },

    // ── SEO ──────────────────────────────────────
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
  },
  {
    timestamps: true,
    // `isNew` collides with Mongoose document API; field name kept for existing data
    suppressReservedKeysWarning: true,
  },
);

PropertySchema.index({
  title: "text",
  description: "text",
  address: "text",
  specification: "text",
  tags: "text",
});
// slug: unique index is already created by `unique: true` on the field
PropertySchema.index({ city: 1, state: 1, country: 1 });
PropertySchema.index({ status: 1, listingType: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ isFeatured: 1, isActive: 1 });
PropertySchema.index({ propertyType: 1, propertySubType: 1 });
PropertySchema.index({ averageRating: -1 });

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);

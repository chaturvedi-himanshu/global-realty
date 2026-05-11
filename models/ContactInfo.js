import mongoose from "mongoose";

const ContactInfoSchema = new mongoose.Schema(
  {
    // ─── Legacy fields (kept for backward compat) ────────────────────────
    phones: [{ type: String }],
    emails: [{ type: String }],
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    workingHours: { type: String, default: "Mon-Sat: 9am - 6pm" },
    contactPageImage: { type: String, default: "" },
    contactAboutTitle: { type: String, default: "" },
    contactAboutSubtitle: { type: String, default: "" },
    aboutPageHeroTitle: { type: String, default: "" },
    aboutPageHeroSubtitle: { type: String, default: "" },
    aboutPageHeroBanner: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },

    // ─── Contact page hero banner ─────────────────────────────────────────
    bannerTitle: { type: String, default: "Contact Us" },
    bannerSubtitle: { type: String, default: "" },
    bannerImage: { type: String, default: "" },

    // ─── Corporate office extras ──────────────────────────────────────────
    reraNumber: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    salesPhone: { type: String, default: "" },

    // ─── Department-wise email categories ────────────────────────────────
    emailCategories: [
      {
        label: { type: String, default: "" },
        email: { type: String, default: "" },
      },
    ],

    // ─── Contact form heading ─────────────────────────────────────────────
    formTitle: { type: String, default: "Contact our Real Estate Experts" },
    formSubtitle: { type: String, default: "" },

    // ─── Trust / USP badges ───────────────────────────────────────────────
    trustBadges: [
      {
        icon: { type: String, default: "" },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
      },
    ],

    // ─── Hero stats (e.g. "500+ Projects") ───────────────────────────────
    heroStats: [
      {
        value: { type: String, default: "" },
        label: { type: String, default: "" },
      },
    ],

    // ─── Branch / satellite offices ───────────────────────────────────────
    branchOffices: [
      {
        city: { type: String, default: "" },
        reraNumber: { type: String, default: "" },
        address: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.ContactInfo ||
  mongoose.model("ContactInfo", ContactInfoSchema);

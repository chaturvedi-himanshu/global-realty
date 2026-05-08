import mongoose from "mongoose";

const ContactInfoSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export default mongoose.models.ContactInfo ||
  mongoose.model("ContactInfo", ContactInfoSchema);

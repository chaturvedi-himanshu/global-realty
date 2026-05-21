import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    interest: { type: String, default: "" },
    message: { type: String, required: true },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    propertyTitle: { type: String, default: "" },
    projectName: { type: String, default: "" },
    pageName: { type: String, default: "" },
    inquiryType: {
      type: String,
      enum: ["agent_connect", "site_visit", "book_meeting"],
      default: "book_meeting",
    },
    visitDate: { type: Date, default: null },
    meetingDateTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
  },
  { timestamps: true }
);

if (mongoose.models?.Inquiry) {
  delete mongoose.models.Inquiry;
}

export default mongoose.model("Inquiry", InquirySchema);

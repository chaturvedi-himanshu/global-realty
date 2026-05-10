import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import JobApplication from "@/models/JobApplication";
import mongoose from "mongoose";
import { sendLeadToCrm } from "@/lib/crmLead";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      linkedinUrl = "",
      jobPostingId,
      jobTitle = "",
      department = "",
      location = "",
      salaryLabel = "",
      coverLetter,
      resumeUrl,
    } = body;

    if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ success: false, error: "Name, email, and phone are required." }, { status: 400 });
    }
    const phoneDigits = String(phone).replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ success: false, error: "Phone must be exactly 10 digits." }, { status: 400 });
    }
    const emailOk =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()) &&
      String(email).length <= 254;
    if (!emailOk) {
      return NextResponse.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }
    if (!coverLetter?.trim()) {
      return NextResponse.json({ success: false, error: "Cover letter is required." }, { status: 400 });
    }
    if (String(coverLetter).trim().length < 20) {
      return NextResponse.json({ success: false, error: "Cover letter is too short." }, { status: 400 });
    }
    if (!resumeUrl?.trim()) {
      return NextResponse.json({ success: false, error: "Resume (PDF) is required." }, { status: 400 });
    }

    const created = await JobApplication.create({
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      phone: phoneDigits,
      linkedinUrl: String(linkedinUrl || "").trim(),
      jobTitle: String(jobTitle || "").trim(),
      department: String(department || "").trim(),
      location: String(location || "").trim(),
      salaryLabel: String(salaryLabel || "").trim(),
      coverLetter: String(coverLetter).trim(),
      resumeUrl: String(resumeUrl).trim(),
      ...(jobPostingId && mongoose.Types.ObjectId.isValid(String(jobPostingId))
        ? { jobPostingId: String(jobPostingId) }
        : {}),
    });
    await sendLeadToCrm({
      name: String(fullName).trim(),
      email: String(email).trim(),
      mobile: phoneDigits,
      formType: "Career Job Application",
      projectName: String(jobTitle || "").trim() || "Careers",
      source: "website-career",
      remark: [
        "Lead from Job Application Form",
        jobTitle ? `Job: ${jobTitle}` : "",
        department ? `Department: ${department}` : "",
        location ? `Location: ${location}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

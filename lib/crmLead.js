import axios from "axios";

const CRM_LEAD_API_URL =
  process.env.CRM_LEAD_API_URL ||
  "https://helptrip.me/WebService/Lead.asmx/InsertLead";

function normalizeMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export async function sendLeadToCrm({
  name,
  email,
  mobile,
  formType = "Website Lead",
  projectName,
  city,
  location,
  source,
  remark,
}) {
  const cleanedName = String(name || "").trim();
  const cleanedEmail = String(email || "").trim();
  const cleanedMobile = normalizeMobile(mobile);
  if (!cleanedName || !cleanedEmail || !cleanedMobile) return { sent: false };

  const payload = new URLSearchParams({
    Name: cleanedName,
    ProjectName:
      String(projectName || "").trim() ||
      process.env.CRM_PROJECT_NAME,
    City: String(city || "").trim(),
    Location:
      String(location || "").trim(),
    Remark:
      String(remark || "").trim() ||
      `Lead from ${String(formType || "Website").trim()} Form`,
    Source: "Global Realty Website",
    Email: cleanedEmail,
    Mobile: cleanedMobile,
  });

  try {
    const response = await axios.post(CRM_LEAD_API_URL, payload.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
    });
    return { sent: true, data: response.data };
  } catch (error) {
    console.error(
      "CRM lead push failed:",
      error?.response?.data || error?.message || error,
    );
    return { sent: false, error: error?.message || "CRM error" };
  }
}

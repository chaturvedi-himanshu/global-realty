import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SiteConfig from "@/models/SiteConfig";
import { getFooterListingInsights } from "@/lib/footerInsights";

export const dynamic = "force-dynamic";

const DEFAULT_NAV_LINKS = [
  { label: "Contact", href: "/contact", active: true },
  { label: "Our team", href: "/team", active: true },
  { label: "Careers", href: "/career", active: true },
  { label: "FAQs", href: "/faq", active: true },
  { label: "Blog", href: "/blogs", active: true },
  { label: "Compare", href: "/compare", active: true },
];

const DEFAULT_FOOTER_V2 = {
  brandName: "Prithvee Real Estate Services",
  brandDescription:
    "On-ground advisory for Noida & Greater Noida. We help you shortlist, coordinate site visits, and support negotiation & closure.",
  serviceAreas: [
    "Noida (Sectors 1–168)",
    "Greater Noida (Alpha/Beta/Gamma)",
    "Yamuna Expressway / YEIDA",
    "Ecotech / Surajpur / Site C",
    "Expressway & Corridor markets",
  ],
  reraItems: [
    {
      label: "Delhi RERA Number: DLRERA2019A0113",
      url: "https://www.rera.delhi.gov.in/",
    },
    {
      label: "UP RERA Number: UPRERAAGT22169",
      url: "https://www.up-rera.in/",
    },
  ],
  trustItems: [
    "Client-first advisory",
    "Transparent communication",
    "Shortlisting & site visit support",
    "Documentation guidance",
  ],
  legalLinks: [
    { label: "Careers", href: "/careers" },
    { label: "Sitemap", href: "/sitemap" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  socialLinks: [
    { label: "Instagram", href: "", color: "#E1306C", platform: "instagram" },
    { label: "Facebook", href: "", color: "#1877F2", platform: "facebook" },
    { label: "WhatsApp", href: "", color: "#25D366", platform: "whatsapp" },
    { label: "YouTube", href: "", color: "#FF0000", platform: "youtube" },
    { label: "LinkedIn", href: "", color: "#0A66C2", platform: "linkedin" },
    { label: "X", href: "", color: "#ffffff", platform: "x" },
  ],
  badges: [
    { title: "Noida/NCR Focus", sub: "Sectors, Expressway, YEIDA" },
    { title: "Verified Options", sub: "Shortlist + site visits" },
  ],
  contactPhone: "+919711099993",
  contactEmailLabel: "Contact by email form",
  contactEmailHref: "/contact",
  contactLocationTitle: "Noida, Uttar Pradesh",
  contactLocationSub: "On-site meetings by appointment",
  enquireLabel: "Enquire Now",
  enquireLink: "/enquire",
  bottomText:
    "© 2026 Prithvee Real Estate Services. All rights reserved.",
};

function toStr(value, fallback = "") {
  const v = String(value || "").trim();
  return v || fallback;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeFooterV2(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    brandName: toStr(src.brandName, DEFAULT_FOOTER_V2.brandName),
    brandDescription: toStr(
      src.brandDescription,
      DEFAULT_FOOTER_V2.brandDescription,
    ),
    serviceAreas: toArray(src.serviceAreas)
      .map((v) => toStr(v))
      .filter(Boolean),
    reraItems: toArray(src.reraItems)
      .map((row) => ({
        label: toStr(row?.label),
        url: toStr(row?.url),
      }))
      .filter((row) => row.label),
    trustItems: toArray(src.trustItems)
      .map((v) => toStr(v))
      .filter(Boolean),
    legalLinks: toArray(src.legalLinks)
      .map((row) => ({
        label: toStr(row?.label),
        href: toStr(row?.href, "/"),
      }))
      .filter((row) => row.label),
    socialLinks: toArray(src.socialLinks)
      .map((row) => ({
        label: toStr(row?.label),
        href: toStr(row?.href),
        color: toStr(row?.color, "#ffffff"),
        platform: toStr(row?.platform).toLowerCase(),
      }))
      .filter((row) => row.label),
    badges: toArray(src.badges)
      .map((row) => ({
        title: toStr(row?.title),
        sub: toStr(row?.sub),
      }))
      .filter((row) => row.title || row.sub),
    contactPhone: toStr(src.contactPhone, DEFAULT_FOOTER_V2.contactPhone),
    contactEmailLabel: toStr(
      src.contactEmailLabel,
      DEFAULT_FOOTER_V2.contactEmailLabel,
    ),
    contactEmailHref: toStr(
      src.contactEmailHref,
      DEFAULT_FOOTER_V2.contactEmailHref,
    ),
    contactLocationTitle: toStr(
      src.contactLocationTitle,
      DEFAULT_FOOTER_V2.contactLocationTitle,
    ),
    contactLocationSub: toStr(
      src.contactLocationSub,
      DEFAULT_FOOTER_V2.contactLocationSub,
    ),
    enquireLabel: toStr(src.enquireLabel, DEFAULT_FOOTER_V2.enquireLabel),
    enquireLink: toStr(src.enquireLink, DEFAULT_FOOTER_V2.enquireLink),
    bottomText: toStr(src.bottomText, DEFAULT_FOOTER_V2.bottomText),
  };
}

function normalizeNavLinks(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_NAV_LINKS;
  return raw
    .filter((item) => item && item.active !== false)
    .map((item) => ({
      label: String(item.label || "").trim() || "Page",
      href: String(item.href || "").trim() || "/",
      active: item.active !== false,
    }))
    .map((item) =>
      item.href === "/properties" && item.label === "Properties"
        ? { ...item, label: "Compare", href: "/compare" }
        : item
    )
    .filter((item) => item.href.startsWith("/"));
}

/** Public footer payload: nav links, insights, copyright, social (from SiteConfig). */
export async function GET() {
  try {
    await connectDB();
    const [configs, insights] = await Promise.all([
      SiteConfig.find().lean(),
      getFooterListingInsights().catch(() => ({
        topCities: [],
        topSubTypes: [],
      })),
    ]);

    const map = {};
    configs.forEach((c) => {
      map[c.key] = c.value;
    });

    const navLinks = normalizeNavLinks(map.footerNavLinks);
    const footerV2 = normalizeFooterV2(map.footerV2);

    if (!footerV2.socialLinks.some((s) => s.href)) {
      footerV2.socialLinks = footerV2.socialLinks.map((s) => {
        const fromLegacy =
          s.platform === "facebook"
            ? toStr(map.socialFacebook)
            : s.platform === "x"
              ? toStr(map.socialTwitter)
              : s.platform === "linkedin"
                ? toStr(map.socialLinkedin)
                : s.platform === "instagram"
                  ? toStr(map.socialInstagram)
                  : "";
        return { ...s, href: s.href || fromLegacy };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        navLinks,
        topCities: insights.topCities,
        topSubTypes: insights.topSubTypes,
        footerText:
          typeof map.footerText === "string" && map.footerText.trim()
            ? map.footerText.trim()
            : `Copyright © ${new Date().getFullYear()} Proty Real Estate`,
        socialFacebook: String(map.socialFacebook || "").trim(),
        socialTwitter: String(map.socialTwitter || "").trim(),
        socialLinkedin: String(map.socialLinkedin || "").trim(),
        socialInstagram: String(map.socialInstagram || "").trim(),
        footerV2,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

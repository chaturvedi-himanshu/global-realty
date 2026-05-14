import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Blogs from "@/components/homes/home-1/Blogs";
import Categories from "@/components/common/Categories";
import Cities from "@/components/homes/home-1/Cities";
import AboutHomeSection from "@/components/homes/home-1/AboutHomeSection";
import PropertyAccordion from "@/components/homes/home-1/PropertyAccordion";
import HelpCenter from "@/components/homes/home-1/HelpCenter";
import Hero from "@/components/homes/home-1/Hero";
import LoanCalculator from "@/components/homes/home-1/LoanCalculator";
import Partners from "@/components/homes/home-1/Partners";
import Properties from "@/components/homes/home-1/Properties";
import Properties2 from "@/components/homes/home-1/Properties2";
import Testimonials from "@/components/homes/home-1/Testimonials";
import CookieDisclaimerBanner from "@/components/common/CookieDisclaimerBanner";
import HomeCtaBanner from "@/components/common/HomeCtaBanner";
import connectDB from "@/lib/mongoose";
import PropertyModel from "@/models/Property";
import PropertyTypeModel from "@/models/PropertyType";
import TestimonialModel from "@/models/Testimonial";
import BlogModel from "@/models/Blog";
import HeroSectionModel from "@/models/HeroSection";
import HelpCenterContentModel from "@/models/HelpCenterContent";
import PartnerLogoModel from "@/models/PartnerLogo";
import AboutSectionModel from "@/models/AboutSection";
import SiteConfigModel from "@/models/SiteConfig";
import HomeAccordionPanelModel from "@/models/HomeAccordionPanel";
import CookieDisclaimerModel from "@/models/CookieDisclaimer";
import HomeCtaBannerModel from "@/models/HomeCtaBanner";
import { resolveHelpCenterContent } from "@/lib/helpCenterResolve";
import { getPageSeo } from "@/lib/seo";
import mongoose from "mongoose";
import { Suspense } from "react";

/** Re-fetch DB SEO periodically so admin updates appear without redeploying */
export const revalidate = 60;

const DEFAULT_COOKIE_DISCLAIMER = {
  title: "Your Privacy Matters",
  paragraphs: [
    "We use essential cookies to ensure site functionality. Additionally, we use supplementary cookies to enhance your experience, personalize ads, and analyze web traffic.",
    "By clicking Accept, you consent to our Privacy Policy and Cookie Policy.",
  ],
  policyText: "Privacy Policy",
  policyUrl: "/privacy-policy",
  acceptText: "Accept",
  closeText: "Close",
  isActive: true,
};

export async function generateMetadata() {
  const { metadata } = await getPageSeo("home", {
    title: "Home | Global Realty - Real Estate",
    description: "Find your dream property with Global Realty",
  });
  return metadata;
}

async function getHomePageData() {
  try {
    await connectDB();

    const [
      properties,
      featuredProperties,
      testimonials,
      blogs,
      heroSlides,
      topCitiesRaw,
      propertyTypeCounts,
      propertyTypes,
      helpCenterDoc,
      partnerLogosRaw,
      aboutSectionRaw,
      heroStatsConfig,
      heroBadgeConfig,
      homeAccordionPanelsRaw,
      cookieDisclaimerRaw,
      homeCtaBannerRaw,
    ] = await Promise.all([
      PropertyModel.find({ isActive: { $ne: false } })
        .populate("propertyType", "name title slug")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []),
      PropertyModel.find({
        isActive: { $ne: false },
        $or: [{ isFeatured: true }, { featured: true }],
      })
        .populate("propertyType", "name title slug")
        .sort({ createdAt: -1 })
        .limit(9)
        .lean()
        .catch(() => []),
      TestimonialModel.find({ isApproved: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(9)
        .lean()
        .catch(() => []),
      BlogModel.find({ status: "published", trending: true })
        .populate("category", "name slug")
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(6)
        .lean()
        .catch(() => []),
      HeroSectionModel.find({ isActive: true })
        .sort({ order: 1 })
        .limit(5)
        .lean()
        .catch(() => []),
      PropertyModel.aggregate([
        { $match: { isActive: { $ne: false }, city: { $type: "objectId" } } },
        { $group: { _id: "$city", propertyCount: { $sum: 1 } } },
        { $sort: { propertyCount: -1 } },
        { $limit: 7 },
      ]).catch(() => []),
      PropertyModel.aggregate([
        {
          $match: {
            isActive: true,
            propertyType: { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$propertyType", count: { $sum: 1 } } },
      ]).catch(() => []),
      PropertyTypeModel.find({ isActive: true })
        .sort({ name: 1 })
        .lean()
        .catch(() => []),
      HelpCenterContentModel.findOne({ key: "home" })
        .lean()
        .catch(() => null),
      PartnerLogoModel.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .select("name image link order")
        .lean()
        .catch(() => []),
      AboutSectionModel.findOne({ isActive: true })
        .lean()
        .catch(() => null),
      SiteConfigModel.findOne({ key: "heroStats" })
        .lean()
        .catch(() => null),
      SiteConfigModel.findOne({ key: "heroBadgeImage" })
        .lean()
        .catch(() => null),
      HomeAccordionPanelModel.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .limit(10)
        .lean()
        .catch(() => []),
      CookieDisclaimerModel.findOne({ key: "home" })
        .lean()
        .catch(() => null),
      HomeCtaBannerModel.findOne({ key: "home" })
        .lean()
        .catch(() => null),
    ]);

    let topCities = [];
    if (topCitiesRaw.length) {
      const cityIds = topCitiesRaw.map((c) => c._id).filter(Boolean);
      const cities = await mongoose.connection
        .collection("cities")
        .find({ _id: { $in: cityIds } })
        .project({ name: 1, image: 1, slug: 1 })
        .toArray();

      const cityMap = new Map(cities.map((c) => [String(c._id), c]));
      topCities = topCitiesRaw
        .map((row) => {
          const city = cityMap.get(String(row._id));
          if (!city?.name) return null;
          return {
            _id: String(city._id),
            cityName: city.name,
            citySlug: city.slug || "",
            image: city.image || "",
            propertyCount: row.propertyCount || 0,
          };
        })
        .filter(Boolean);
    }

    const typeCountMap = new Map(
      (propertyTypeCounts || []).map((row) => [
        String(row._id),
        row.count || 0,
      ]),
    );
    const categoryItems = (propertyTypes || [])
      .filter((t) => t?._id && t.slug)
      .map((t) => ({
        slug: t.slug,
        name: t.name,
        icon: t.icon || "",
        count: typeCountMap.get(String(t._id)) || 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const helpCenterContent = resolveHelpCenterContent(helpCenterDoc);

    const partnerLogos = (partnerLogosRaw || [])
      .filter((p) => p?.image && String(p.image).trim())
      .map((p) => ({
        _id: String(p._id),
        name: p.name || "Partner",
        image: String(p.image).trim(),
        link: (p.link && String(p.link).trim()) || "",
      }));

    const aboutSection = aboutSectionRaw
      ? {
          eyebrow: String(
            aboutSectionRaw.eyebrow || "Why Choose Our Properties",
          ),
          title: String(aboutSectionRaw.title || ""),
          description: String(aboutSectionRaw.description || ""),
          image: String(aboutSectionRaw.image || ""),
          mediaLink: String(aboutSectionRaw.mediaLink || ""),
          highlights: Array.isArray(aboutSectionRaw.highlights)
            ? aboutSectionRaw.highlights
                .map((x) => String(x || "").trim())
                .filter(Boolean)
            : Array.isArray(aboutSectionRaw.stats)
              ? aboutSectionRaw.stats
                  .map((x) =>
                    `${String(x?.label || "").trim()}${x?.value ? ` - ${String(x.value).trim()}` : ""}`.trim(),
                  )
                  .filter(Boolean)
              : [],
          ctaText: String(aboutSectionRaw.ctaText || "Read More"),
          ctaLink: String(aboutSectionRaw.ctaLink || "/about-us"),
          isActive: aboutSectionRaw.isActive !== false,
        }
      : null;

    const heroStats = Array.isArray(heroStatsConfig?.value)
      ? heroStatsConfig.value
          .map((row) => ({
            label: String(row?.label || "").trim(),
            value: Number(row?.value || 0),
            suffix: String(row?.suffix || "").trim(),
          }))
          .filter(
            (row) => row.label && Number.isFinite(row.value) && row.value > 0,
          )
      : [];
    const heroBadgeImage =
      typeof heroBadgeConfig?.value === "string"
        ? heroBadgeConfig.value.trim()
        : "";
    const homeAccordionPanels = (homeAccordionPanelsRaw || []).map((p) => ({
      key: String(p.key || ""),
      label: String(p.label || ""),
      tagline: String(p.tagline || ""),
      image: String(p.image || ""),
      href: String(p.href || "#"),
      order: Number(p.order || 0),
    }));
    const cookieDisclaimer = cookieDisclaimerRaw
      ? {
          title: String(cookieDisclaimerRaw.title || "Your Privacy Matters"),
          paragraphs: Array.isArray(cookieDisclaimerRaw.paragraphs)
            ? cookieDisclaimerRaw.paragraphs
                .map((x) => String(x || ""))
                .filter(Boolean)
            : [],
          policyText: String(
            cookieDisclaimerRaw.policyText || "Privacy Policy",
          ),
          policyUrl: String(cookieDisclaimerRaw.policyUrl || "/privacy-policy"),
          acceptText: String(cookieDisclaimerRaw.acceptText || "Accept"),
          closeText: String(cookieDisclaimerRaw.closeText || "Close"),
          isActive: cookieDisclaimerRaw.isActive !== false,
        }
      : DEFAULT_COOKIE_DISCLAIMER;
    const homeCtaBanner = homeCtaBannerRaw
      ? {
          heading: String(
            homeCtaBannerRaw.heading || "Let's Talk About Your Dream Property",
          ),
          buttonText: String(homeCtaBannerRaw.buttonText || "Contact Us"),
          buttonLink: String(homeCtaBannerRaw.buttonLink || "/contact"),
          backgroundImage: String(
            homeCtaBannerRaw.backgroundImage || "/images/cta-bg.jpg",
          ),
          overlayColor: String(homeCtaBannerRaw.overlayColor || "#0a141e"),
          overlayOpacity: Number.isFinite(
            Number(homeCtaBannerRaw.overlayOpacity),
          )
            ? Math.min(1, Math.max(0, Number(homeCtaBannerRaw.overlayOpacity)))
            : 0.78,
          isActive: homeCtaBannerRaw.isActive !== false,
        }
      : {
          heading: "Let's Talk About Your Dream Property",
          buttonText: "Contact Us",
          buttonLink: "/contact",
          backgroundImage: "/images/cta-bg.jpg",
          overlayColor: "#0a141e",
          overlayOpacity: 0.78,
          isActive: true,
        };

    return {
      properties: JSON.parse(JSON.stringify(properties)),
      featuredProperties: JSON.parse(JSON.stringify(featuredProperties)),
      testimonials: JSON.parse(JSON.stringify(testimonials)),
      blogs: JSON.parse(JSON.stringify(blogs)),
      heroSlides: JSON.parse(JSON.stringify(heroSlides)),
      topCities: JSON.parse(JSON.stringify(topCities)),
      categoryItems: JSON.parse(JSON.stringify(categoryItems)),
      helpCenterContent: JSON.parse(JSON.stringify(helpCenterContent)),
      partnerLogos: JSON.parse(JSON.stringify(partnerLogos)),
      aboutSection: JSON.parse(JSON.stringify(aboutSection)),
      heroStats: JSON.parse(JSON.stringify(heroStats)),
      heroBadgeImage: JSON.parse(JSON.stringify(heroBadgeImage)),
      homeAccordionPanels: JSON.parse(JSON.stringify(homeAccordionPanels)),
      cookieDisclaimer: JSON.parse(JSON.stringify(cookieDisclaimer)),
      homeCtaBanner: JSON.parse(JSON.stringify(homeCtaBanner)),
    };
  } catch {
    return {
      properties: [],
      featuredProperties: [],
      testimonials: [],
      blogs: [],
      heroSlides: [],
      topCities: [],
      categoryItems: [],
      helpCenterContent: resolveHelpCenterContent(null),
      partnerLogos: [],
      aboutSection: null,
      heroStats: [],
      heroBadgeImage: "",
      homeAccordionPanels: [],
      cookieDisclaimer: DEFAULT_COOKIE_DISCLAIMER,
      homeCtaBanner: {
        heading: "Let's Talk About Your Dream Property",
        buttonText: "Contact Us",
        buttonLink: "/contact",
        backgroundImage: "/images/cta-bg.jpg",
        overlayColor: "#0a141e",
        overlayOpacity: 0.78,
        isActive: true,
      },
    };
  }
}

export default async function Home() {
  const {
    properties,
    featuredProperties,
    testimonials,
    blogs,
    heroSlides,
    topCities,
    categoryItems,
    helpCenterContent,
    partnerLogos,
    aboutSection,
    heroStats,
    heroBadgeImage,
    homeAccordionPanels,
    cookieDisclaimer,
    homeCtaBanner,
  } = await getHomePageData();

  return (
    <>
      <Header1 />
      <Suspense
        fallback={
          <div
            className="page-title home01"
            style={{
              minHeight: "clamp(560px, 94vh, 860px)",
              background: "#1f2124",
            }}
          />
        }
      >
        <Hero
          heroSlides={heroSlides}
          propertyTypes={categoryItems}
          heroStats={heroStats}
          heroBadgeImage={heroBadgeImage}
        />
      </Suspense>
      <div className="main-content home-page-content">
        {/* <Categories items={categoryItems} /> */}
        <Properties properties={featuredProperties.slice(0, 6)} />
        <AboutHomeSection content={aboutSection} />
        <section className="tf-spacing-1">
          <PropertyAccordion panels={homeAccordionPanels} />
        </section>
        <HelpCenter content={helpCenterContent} />
        {/* <LoanCalculator /> */}
        <Cities cities={topCities.slice(0, 4)} />
        <Properties2 properties={properties} />
        <Partners partnerLogos={partnerLogos} />
        <Blogs blogs={blogs} topPadding={56} />
        <Testimonials testimonials={testimonials} />
        <HomeCtaBanner content={homeCtaBanner} />
      </div>
      <CookieDisclaimerBanner content={cookieDisclaimer} />
      <Footer1 />
    </>
  );
}

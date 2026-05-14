import Breadcumb from "@/components/common/Breadcumb";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Cta from "@/components/otherPages/faq/Cta";
import Faqs from "@/components/otherPages/faq/Faqs";
import { getPageSeo } from "@/lib/seo";
import connectDB from "@/lib/mongoose";
import FAQ from "@/models/FAQ";
import React from "react";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("faq", {
    title: "FAQ | Global Realty",
    description: "Frequently asked questions about buying, selling, and renting with Global Realty.",
  });
  return metadata;
}

async function getFaqPageData() {
  try {
    await connectDB();
    const faqsRaw = await FAQ.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return {
      faqs: JSON.parse(JSON.stringify(faqsRaw || [])),
    };
  } catch {
    return { faqs: [] };
  }
}

export default async function page() {
  const { faqs } = await getFaqPageData();

  return (
    <>
      <div id="wrapper" className="counter-scroll">
        <Header1 />
        <Breadcumb pageName="FAQS" />
        <div className="main-content tf-spacing-6 header-fixed">
          <Faqs faqs={faqs} />
        </div>
        <Footer1 />
      </div>
    </>
  );
}

import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Benefits from "@/components/otherPages/career/Benefits";
import Jobs from "@/components/otherPages/career/Jobs";
import PageTitle from "@/components/otherPages/career/PageTitle";
import { mergeCareerPage } from "@/lib/careerPageDefaults";
import { getPageSeo } from "@/lib/seo";
import connectDB from "@/lib/mongoose";
import CareerPage from "@/models/CareerPage";
import JobPosting from "@/models/JobPosting";
import React from "react";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("career", {
    title: "Careers | Global Realty",
    description: "Join our team and build your career in real estate.",
  });
  return metadata;
}

async function getCareerData() {
  try {
    await connectDB();
    const [cDoc, jobsRaw] = await Promise.all([
      CareerPage.findOne({ key: "main" }).lean(),
      JobPosting.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean(),
    ]);
    const career = mergeCareerPage(cDoc);
    const jobs = JSON.parse(JSON.stringify(jobsRaw || []));
    return { career, jobs };
  } catch {
    return { career: mergeCareerPage(null), jobs: [] };
  }
}

export default async function page() {
  const { career, jobs } = await getCareerData();

  return (
    <>
      <div id="wrapper" className="counter-scroll">
        <Header1 />
        <PageTitle
          heroTitle={career.heroTitle}
          heroSubtitle={career.heroSubtitle}
          bannerImage={career.heroBannerImage}
        />
        <div className="main-content">
          <Jobs career={career} jobs={jobs} />
          <Benefits career={career} />
          </div>
        <Footer1 />
      </div>
    </>
  );
}

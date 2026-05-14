import Agents from "@/components/agents/Agents";
import Breadcumb from "@/components/common/Breadcumb";
import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { getPageSeo } from "@/lib/seo";
import React from "react";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("team", {
    title: "Our Team | Global Realty",
    description: "Meet our real estate team",
  });
  return metadata;
}

export default function TeamPage() {
  return (
    <>
      <div id="wrapper">
        <Header1 />
        <div className="page-content">
          <Breadcumb pageName="Our team" />
          <Agents />
        </div>
        <Footer1 />
      </div>
    </>
  );
}

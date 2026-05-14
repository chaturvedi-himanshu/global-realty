import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Cta from "@/components/otherPages/LoanProcess/Cta";
import Facts from "@/components/otherPages/LoanProcess/Facts";
import LoanCalculator from "@/components/otherPages/LoanProcess/LoanCalculator";
import PageTitle from "@/components/otherPages/LoanProcess/PageTitle";
import Process from "@/components/otherPages/LoanProcess/Process";
import { getPageSeo } from "@/lib/seo";
import React from "react";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("home-loan-process", {
    title: "Home Loan Process | Global Realty",
    description: "Understand the home loan process and get closer to owning your property.",
  });
  return metadata;
}

export default function page() {
  return (
    <>
      <div id="wrapper" className="counter-scroll">
        <Header1 />
        <PageTitle />
        <div className="main-content">
          <Facts />
          <Process />
          <LoanCalculator />
        </div>
        <Footer1 />
      </div>
    </>
  );
}

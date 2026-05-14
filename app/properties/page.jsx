import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import FilterTop from "@/components/properties/FilterTop";
import Properties2 from "@/components/properties/Properties2";
import { Suspense } from "react";
import { getPageSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("properties", {
    title: "Properties | Global Realty",
    description: "Browse all properties available for sale",
  });
  return metadata;
}

export default function Page() {
  return (
    <div id="wrapper">
      <Header1 />
      <Suspense fallback={<div style={{ height: 80 }} />}>
        <FilterTop />
      </Suspense>
      <div className="main-content">
        <Suspense fallback={<div className="p-8 text-center">Loading properties...</div>}>
          <Properties2 defaultGrid />
        </Suspense>
      </div>
      <Footer1 />
    </div>
  );
}

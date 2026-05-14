import Breadcumb from "@/components/common/Breadcumb";
import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import PropertyComparison from "@/components/compare/PropertyComparison";
import { getPageSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("compare", {
    title: "Compare Properties | Global Realty",
    description: "Compare selected properties side by side.",
  });
  return metadata;
}

export default function page() {
  return (
    <>
      <div id="wrapper" className="counter-scroll">
        <Header1 />
        <Breadcumb pageName="Compare" />
        <div className="main-content">
          <PropertyComparison />
        </div>
        <Footer1 />
      </div>
    </>
  );
}

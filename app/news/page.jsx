import React, { Suspense } from "react";
import Breadcumb from "@/components/common/Breadcumb";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import NewsList from "@/components/news/NewsList";
import { getPageSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("news", {
    title: "News | Global Realty",
    description:
      "Stay up to date with the latest real estate news, market updates, and industry insights.",
  });
  return metadata;
}

export default function NewsPage() {
  return (
    <div id="wrapper">
      <Header1 />
      <div className="main-content blogs-page-content news-page-content">
        <Breadcumb pageName="News" />
        <Suspense
          fallback={
            <p className="text-1 text-center tf-container py-5">Loading…</p>
          }
        >
          <NewsList />
        </Suspense>
      </div>
      <Footer1 />
    </div>
  );
}

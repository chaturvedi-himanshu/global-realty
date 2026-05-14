import Blogs2 from "@/components/blogs/Blogs2";
import Blogs from "@/components/homes/home-1/Blogs";
import Breadcumb from "@/components/common/Breadcumb";
import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React, { Suspense } from "react";
import { getPageSeo } from "@/lib/seo";
import connectDB from "@/lib/mongoose";
import Blog from "@/models/Blog";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("blog", {
    title: "Blogs | Global Realty",
    description: "Browse our latest real estate blog posts, tips, and market insights.",
  });
  return metadata;
}

async function getTrendingBlogs() {
  try {
    await connectDB();
    const blogs = await Blog.find({ status: "published", trending: true })
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();
    return blogs || [];
  } catch {
    return [];
  }
}

export default async function page() {
  const trendingBlogs = await getTrendingBlogs();
  const excludeBlogIds = trendingBlogs.map((b) => String(b._id));

  return (
    <>
      <div id="wrapper">
        <Header1 />
        <div className="main-content blogs-page-content">
          <Breadcumb pageName="Blogs" />
          {trendingBlogs.length ? (
            <Blogs blogs={trendingBlogs} showHeading={false} topPadding={0} />
          ) : null}
          <Suspense fallback={<p className="text-1 text-center tf-container py-5">Loading…</p>}>
            <Blogs2 excludeBlogIds={excludeBlogIds} />
          </Suspense>
        </div>
        <Footer1 />
      </div>
    </>
  );
}

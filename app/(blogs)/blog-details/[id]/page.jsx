import BlogDetailsClient from "@/components/blogs/BlogDetailsClient";
import RelatedBlogs from "@/components/blogs/RelatedBlogs";
import Breadcumb from "@/components/common/Breadcumb";
import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import connectDB from "@/lib/mongoose";
import Blog from "@/models/Blog";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

async function getBlog(id) {
  try {
    await connectDB();
    let blog = null;

    // Slug-first for canonical URLs
    blog = await Blog.findOne({ slug: id }).populate("category", "name slug").lean();
    if (!blog && mongoose.isValidObjectId(id)) {
      blog = await Blog.findById(id).populate("category", "name slug").lean();
    }

    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);
  return {
    title: blog ? `${blog.title} | Blog` : "Blog Details | Global Realty",
    description: blog?.excerpt || "Read our latest real estate insights",
  };
}

export default async function page({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) notFound();
  if (blog.slug && id !== blog.slug) {
    redirect(`/blog-details/${blog.slug}`);
  }

  return (
    <>
      <div id="wrapper">
        <Header1 />
        <div className="main-content">
          <Breadcumb pageName="Blog Details" />
          <BlogDetailsClient blog={blog} />
          <RelatedBlogs currentId={blog._id} categoryId={blog.category?._id} />
        </div>
        <Footer1 />
      </div>
    </>
  );
}

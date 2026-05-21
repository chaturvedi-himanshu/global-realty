import { notFound } from "next/navigation";
import Link from "next/link";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import connectDB from "@/lib/mongoose";
import StaticPage from "@/models/StaticPage";

export const revalidate = 60;
export const dynamicParams = true;

async function getPage(slug) {
  try {
    await connectDB();
    const doc = await StaticPage.findOne({
      slug: String(slug).toLowerCase(),
      status: "published",
    }).lean();
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.metaTitle || `${page.title} | Global Realty`,
    description: page.metaDescription || page.bannerSubheading || undefined,
  };
}

export default async function DynamicStaticPage({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return notFound();

  const heading = String(page.bannerHeading || "").trim() || page.title;
  const subheading = String(page.bannerSubheading || "").trim();
  const breadcrumbLabel =
    String(page.breadcrumbLabel || "").trim() || page.title;
  const bannerImage = String(page.bannerImage || "").trim();
  const overlayColor =
    String(page.bannerOverlayColor || "").trim() || "rgba(15, 23, 42, 0.55)";

  return (
    <div id="wrapper">
      <Header1 />
      <div className="main-content static-page">
        <header
          className="static-page-banner"
          style={{
            backgroundImage: bannerImage ? `url(${bannerImage})` : undefined,
          }}
        >
          <div
            className="static-page-banner__overlay"
            style={{ background: overlayColor }}
            aria-hidden="true"
          />
          <div className="tf-container">
            <div className="static-page-banner__content">
              <nav className="static-page-breadcrumb" aria-label="Breadcrumb">
                <ol>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li aria-current="page">{breadcrumbLabel}</li>
                </ol>
              </nav>
              <h1 className="static-page-banner__title">{heading}</h1>
              {subheading ? (
                <p className="static-page-banner__sub">{subheading}</p>
              ) : null}
            </div>
          </div>
        </header>

        <section className="static-page-content-section">
          <div className="tf-container">
            <article
              className="static-page-content"
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
          </div>
        </section>
      </div>
      <Footer1 />
    </div>
  );
}

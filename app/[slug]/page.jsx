import { notFound } from "next/navigation";
import Link from "next/link";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import StaticPageProperties from "@/components/pages/StaticPageProperties";
import connectDB from "@/lib/mongoose";
import StaticPage from "@/models/StaticPage";
import Property from "@/models/Property";

export const revalidate = 60;
export const dynamicParams = true;

const isObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

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

async function getPageProperties(propertyIds = []) {
  const ids = (Array.isArray(propertyIds) ? propertyIds : [])
    .map((id) => String(id || "").trim())
    .filter(isObjectId);
  if (!ids.length) return [];

  try {
    await connectDB();
    const docs = await Property.find({
      _id: { $in: ids },
      isActive: { $ne: false },
    })
      .populate("propertyType", "name title slug")
      .lean();

    return ids
      .map((id) => docs.find((doc) => String(doc._id) === id))
      .filter(Boolean)
      .map((doc) => JSON.parse(JSON.stringify(doc)));
  } catch {
    return [];
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

  const properties =
    page.showProperties && Array.isArray(page.propertyIds) && page.propertyIds.length
      ? await getPageProperties(page.propertyIds)
      : [];

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

        {page.showProperties && properties.length > 0 ? (
          <StaticPageProperties properties={properties} />
        ) : null}
      </div>
      <Footer1 />
    </div>
  );
}

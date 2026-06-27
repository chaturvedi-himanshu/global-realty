import Header1 from "@/components/headers/Header1";
import AboutLeadershipTeam from "@/components/about/AboutLeadershipTeam";
import AboutHeroStatsBand from "@/components/about/AboutHeroStatsBand";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";
import connectDB from "@/lib/mongoose";
import AboutPage from "@/models/AboutPage";
import TestimonialModel from "@/models/Testimonial";
import SiteConfigModel from "@/models/SiteConfig";
import { mergeAboutPage } from "@/lib/aboutPageDefaults";
import { getPageSeo } from "@/lib/seo";
import {
  FiShield,
  FiEye,
  FiUser,
  FiFeather,
  FiGlobe,
  FiTrendingUp,
  FiTarget,
  FiCheckCircle,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiHeadphones,
  FiMapPin,
  FiArrowRight,
  FiStar,
} from "react-icons/fi";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("about", {
    title: "About Us | Global Realty",
    description: "Learn about our vision, values, and real estate expertise.",
  });
  return metadata;
}

async function getAboutData() {
  try {
    await connectDB();
    const [doc, testimonialsRaw, heroStatsConfig] = await Promise.all([
      AboutPage.findOne({ key: "main" }).lean(),
      TestimonialModel.find({ isApproved: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []),
      SiteConfigModel.findOne({ key: "heroStats" })
        .lean()
        .catch(() => null),
    ]);
    const homepageHeroStats = Array.isArray(heroStatsConfig?.value)
      ? heroStatsConfig.value
          .map((row) => ({
            label: String(row?.label || "").trim(),
            value: Number(row?.value || 0),
            suffix: String(row?.suffix || "").trim(),
          }))
          .filter(
            (row) => row.label && Number.isFinite(row.value) && row.value > 0,
          )
      : [];
    return {
      page: mergeAboutPage(doc),
      testimonials: JSON.parse(JSON.stringify(testimonialsRaw || [])),
      homepageHeroStats,
    };
  } catch {
    return {
      page: mergeAboutPage(null),
      testimonials: [],
      homepageHeroStats: [],
    };
  }
}

export default async function AboutPageRoute() {
  const { page: data, testimonials, homepageHeroStats } = await getAboutData();
  const testimonialItems = (testimonials || []).filter(
    (item) => item?.video || item?.message || item?.review || item?.content
  );
  const valueIcons = [FiShield, FiEye, FiUser, FiFeather, FiGlobe];
  const whyIcons = [FiCheckCircle, FiUsers, FiFileText, FiBarChart2, FiHeadphones, FiMapPin];
  const storyParagraphs = Array.isArray(data.storyParagraphs) && data.storyParagraphs.length
    ? data.storyParagraphs.filter((x) => String(x || "").trim())
    : [data.storyParagraph1, data.storyParagraph2, data.storyParagraph3].filter((x) => String(x || "").trim());

  return (
    <>
      <Header1 />
      <div className="main-content about-page about-v2">
        <section className="about-v2-hero about-v2-hero--video">
          {data.heroVideo ? (
            <video
              className="about-v2-hero__video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={data.heroBackgroundImage || undefined}
            >
              <source src={data.heroVideo} />
            </video>
          ) : (
            <div
              className="about-v2-hero__video about-v2-hero__video--fallback"
              style={{
                backgroundImage: `url(${data.heroBackgroundImage || "/images/slider/slider-1.jpg"})`,
              }}
            />
          )}
        </section>

        <AboutHeroStatsBand
          stats={homepageHeroStats}
          backgroundImage={data.statsBackgroundImage}
          overlayColor={data.statsOverlayColor}
        />

        <section className="about-v2-relationships about-v2-story-section">
          <div className="about-v2-story-section__glow" aria-hidden />
          <div className="tf-container about-v2-story-grid">
            <div className="about-v2-story-left">
              <div className="about-v2-section-eyebrow">Who we are</div>
              <h2>{data.storyTitle}</h2>
              <div className="about-v2-story-cards">
                {storyParagraphs.map((paragraph, idx) => (
                  <article
                    key={`story-p-${idx}`}
                    className="about-v2-story-card"
                    style={{ "--i": idx }}
                  >
                    <span className="about-v2-story-card__index" aria-hidden>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p>{paragraph}</p>
                  </article>
                ))}
              </div>
            </div>

            {Array.isArray(data.values) && data.values.length ? (
              <aside className="about-v2-story-values" aria-label="Our core values">
                <div className="about-v2-story-values__head">
                  <h3>{data.valuesTitle || "Core Values"}</h3>
                  {data.valuesDescription ? (
                    <p className="about-v2-story-values__sub">{data.valuesDescription}</p>
                  ) : null}
                </div>
                <ul className="about-v2-story-values__list">
                  {data.values.map((item, idx) => {
                    const Icon = valueIcons[idx % valueIcons.length];
                    return (
                      <li
                        key={`${item.title}-${idx}`}
                        className="about-v2-story-value"
                        style={{ "--i": idx }}
                      >
                        <span className="about-v2-story-value__icon" aria-hidden>
                          <Icon size={18} />
                        </span>
                        <div className="about-v2-story-value__text">
                          <h4>{item.title}</h4>
                          {item.description || item.tagline ? (
                            <p>{item.description || item.tagline}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            ) : null}
          </div>
        </section>

        <section className="about-v2-leadership" id="about-v2-team">
          <div className="tf-container">
            <div className="about-v2-section-eyebrow">{data.leadershipEyebrow}</div>
            <h2>{data.leadershipTitle}</h2>
            <p>{data.leadershipDescription}</p>
            <AboutLeadershipTeam leaders={data.leaders} />
          </div>
        </section>

        {/* <section className="about-v2-journey" id="journey">
          <div className="tf-container about-v2-journey-inner">
            <div className="about-v2-journey-left">
              <div className="about-v2-section-eyebrow">{data.journeyEyebrow}</div>
              <h2>{data.journeyTitle}</h2>
              <p>{data.journeyDescription}</p>
            </div>
            <div className="about-v2-timeline">
              {data.journeyTimeline.map((item, idx) => (
                <div
                  key={`${item.year}-${idx}`}
                  className="about-v2-timeline-item"
                  style={{ "--i": idx }}
                >
                  <div className="about-v2-timeline-dot-col">
                    <div className="about-v2-timeline-dot" />
                    {idx < data.journeyTimeline.length - 1 ? <div className="about-v2-timeline-line" /> : null}
                  </div>
                  <div className="about-v2-timeline-content">
                    <div className="about-v2-year">{item.year}</div>
                    <h5>{item.title}</h5>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* <section className="about-v2-values">
          <div className="tf-container">
            <div className="about-v2-values-header">
              <div className="about-v2-section-eyebrow">Our</div>
              <h2>{data.valuesTitle}</h2>
              <p>{data.valuesDescription}</p>
            </div>
            <div className="about-v2-values-grid">
              {data.values.map((item, idx) => {
                const Icon = valueIcons[idx % valueIcons.length];
                return (
                  <div key={`${item.title}-${idx}`} className="about-v2-value-card">
                    <div className="about-v2-value-icon">
                      <Icon size={20} />
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section> */}

        {/* <section className="about-v2-mission">
          <div className="tf-container">
            <div className="about-v2-section-eyebrow">{data.missionEyebrow}</div>
            <h2>{data.missionTitle}</h2>
            <p>{data.missionDescription}</p>
            <div className="about-v2-mission-grid">
              <div className="about-v2-mission-card">
                <div className="about-v2-mission-icon"><FiTrendingUp size={18} /></div>
                <h3>{data.missionHeading}</h3>
                <p>{data.missionText}</p>
              </div>
              <div className="about-v2-mission-card">
                <div className="about-v2-mission-icon"><FiTarget size={18} /></div>
                <h3>{data.visionHeading}</h3>
                <p>{data.visionText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-v2-why">
          <div className="tf-container">
            <div className="about-v2-why-header">
              <div className="about-v2-section-eyebrow">{data.whyChooseEyebrow}</div>
              <h2>{data.whyChooseTitle}</h2>
              <p>{data.whyChooseDescription}</p>
            </div>
            <div className="about-v2-why-grid">
              {data.whyChooseItems.map((item, idx) => {
                const Icon = whyIcons[idx % whyIcons.length];
                return (
                  <div key={`${item.title}-${idx}`} className="about-v2-why-card">
                    <div className="about-v2-why-icon"><Icon size={18} /></div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    {item.tagline ? <div className="tagline">{item.tagline}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {testimonialItems.length > 0 ? (
        <section className="about-v2-testimonials">
          <div className="tf-container">
            <div className="about-v2-section-eyebrow">{data.testimonialsEyebrow}</div>
            <h2>{data.testimonialsTitle}</h2>
            <p>{data.testimonialsDescription}</p>
            <div className="about-v2-testimonials-grid">
              {testimonialItems.map((item, idx) => {
                  const text = item.message || item.review || item.content || "";
                  const designation =
                    [item.designation, item.role].find((x) => String(x || "").trim()) || "";
                  const company = String(item.company || "").trim();
                  const subtitle =
                    designation && company
                      ? `${designation} • ${company}`
                      : designation || company;

                  return (
                    <div key={`${item._id || item.name}-${idx}`} className="about-v2-testimonial-card">
                      {item.video ? (
                        <div
                          style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            aspectRatio: "16 / 9",
                            background: "#0f172a",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <video
                            src={item.video}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </div>
                      ) : null}
                      {text && !item.video ? <p>{text}</p> : null}
                      <div className="about-v2-testimonial-author">
                        <h5>{item.name}</h5>
                        {subtitle ? <span>{subtitle}</span> : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
        ) : null} */}
      </div>
      <Footer1 />
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";
import connectDB from "@/lib/mongoose";
import AboutPage from "@/models/AboutPage";
import TestimonialModel from "@/models/Testimonial";
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
    const [doc, testimonialsRaw] = await Promise.all([
      AboutPage.findOne({ key: "main" }).lean(),
      TestimonialModel.find({ isApproved: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []),
    ]);
    return {
      page: mergeAboutPage(doc),
      testimonials: JSON.parse(JSON.stringify(testimonialsRaw || [])),
    };
  } catch {
    return {
      page: mergeAboutPage(null),
      testimonials: [],
    };
  }
}

export default async function AboutPageRoute() {
  const { page: data, testimonials } = await getAboutData();
  const valueIcons = [FiShield, FiEye, FiUser, FiFeather, FiGlobe];
  const whyIcons = [FiCheckCircle, FiUsers, FiFileText, FiBarChart2, FiHeadphones, FiMapPin];
  const storyParagraphs = Array.isArray(data.storyParagraphs) && data.storyParagraphs.length
    ? data.storyParagraphs.filter((x) => String(x || "").trim())
    : [data.storyParagraph1, data.storyParagraph2, data.storyParagraph3].filter((x) => String(x || "").trim());

  return (
    <>
      <Header1 />
      <div className="main-content about-page about-v2">
        <section className="about-v2-hero">
          <div className="about-v2-hero-house" style={{ backgroundImage: `url(${data.heroBackgroundImage || "/images/slider/slider-1.jpg"})` }} />
          <div className="about-v2-hero-bg" />
          <div className="tf-container">
            <div className="about-v2-hero-content">
              <div className="about-v2-hero-left">
                <div className="about-v2-hero-badge">{data.heroBadge}</div>
                <h1>{data.heroTitle}</h1>
                <p className="about-v2-hero-desc">{data.heroSubtitle}</p>
                <div className="about-v2-hero-stats">
                  {data.heroStats.map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="about-v2-stat-box">
                      <span className="num">{item.value}</span>
                      <div className="label">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="about-v2-hero-btns">
                  <Link className="about-v2-btn-outline-white" href={data.heroPrimaryCtaLink || "#about-v2-journey"}>
                    {data.heroPrimaryCtaText}
                  </Link>
                  <Link className="about-v2-btn-white-filled" href={data.heroSecondaryCtaLink || "#about-v2-team"}>
                    {data.heroSecondaryCtaText}
                  </Link>
                </div>
              </div>
              <div className="about-v2-trust-card">
                <div className="about-v2-trust-label">{data.introEyebrow}</div>
                <h3>{data.introTitle}</h3>
                <p>{data.introDescription}</p>
                <div className="about-v2-trust-metrics">
                  {data.introHighlights.map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="about-v2-trust-metric-item">
                      <span className="metric-val">{item.label}</span>
                      <div className="metric-desc">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-v2-relationships">
          <div className="tf-container">
            <h2>{data.storyTitle}</h2>
            {storyParagraphs.map((paragraph, idx) => (
              <p key={`story-p-${idx}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="about-v2-leadership" id="about-v2-team">
          <div className="tf-container">
            <div className="about-v2-section-eyebrow">{data.leadershipEyebrow}</div>
            <h2>{data.leadershipTitle}</h2>
            <p>{data.leadershipDescription}</p>
            <div className="about-v2-team-grid">
              {data.leaders.map((leader, idx) => (
                <div key={`${leader.name}-${idx}`} className="about-v2-team-card">
                  <div className="about-v2-team-card-img-wrap">
                    {leader.image ? (
                      <Image
                        className="about-v2-team-card-img"
                        src={leader.image}
                        alt={leader.name || "Leader"}
                        fill
                        sizes="(max-width: 991px) 100vw, 33vw"
                      />
                    ) : (
                      <div className={`about-v2-team-img-placeholder img-p${(idx % 3) + 1}`}>👤</div>
                    )}
                  </div>
                  <div className="about-v2-team-card-info">
                    <h4>{leader.name}</h4>
                    <span>{leader.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-v2-journey" id="journey">
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
        </section>

        <section className="about-v2-values">
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
        </section>

        <section className="about-v2-mission">
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

        <section className="about-v2-testimonials">
          <div className="tf-container">
            <div className="about-v2-section-eyebrow">{data.testimonialsEyebrow}</div>
            <h2>{data.testimonialsTitle}</h2>
            <p>{data.testimonialsDescription}</p>
            <div className="about-v2-testimonials-grid">
              {testimonials.map((item, idx) => (
                <div key={`${item._id || item.name}-${idx}`} className="about-v2-testimonial-card">
                  <p>{item.message || item.review || item.content || ""}</p>
                  <div className="about-v2-testimonial-author">
                    <h5>{item.name}</h5>
                    <span>{item.role || item.designation || item.company || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Cta />
      </div>
      <Footer1 />
    </>
  );
}

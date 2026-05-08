"use client";
import useSWR from "@/lib/swr-lite";
import Link from "next/link";


const STAT_CARDS = [
  {
    key: "properties",
    title: "Total Properties",
    getValue: (s) => s?.properties?.total ?? 0,
    getSub: (s) => `${s?.properties?.active ?? 0} active`,
    href: "/admin/properties",
    cls: "ap-stat-card--blue",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "blogs",
    title: "Total Blogs",
    getValue: (s) => s?.blogs?.total ?? 0,
    getSub: (s) => `${s?.blogs?.published ?? 0} published`,
    href: "/admin/blogs",
    cls: "ap-stat-card--emerald",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    key: "inquiries",
    title: "Inquiries",
    getValue: (s) => s?.inquiries?.total ?? 0,
    getSub: (s) => `${s?.inquiries?.new ?? 0} new`,
    href: "/admin/inquiries",
    cls: "ap-stat-card--amber",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    key: "newsletter",
    title: "Subscribers",
    getValue: (s) => s?.newsletter?.subscribers ?? 0,
    getSub: () => "newsletter",
    href: "/admin/newsletter",
    cls: "ap-stat-card--violet",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const QUICK_ACTIONS = [
  { label: "Add Property", href: "/properties/add", icon: "🏠", cls: "ap-quick-action--blue" },
  { label: "Write Blog", href: "/blogs/add", icon: "✍️", cls: "ap-quick-action--emerald" },
  { label: "Property Types", href: "/property-types", icon: "🏷️", cls: "ap-quick-action--amber" },
  { label: "Amenities", href: "/amenities", icon: "⭐", cls: "ap-quick-action--purple" },
  { label: "Testimonials", href: "/cms/testimonials", icon: "💬", cls: "ap-quick-action--pink" },
  { label: "Theme Settings", href: "/theme", icon: "🎨", cls: "ap-quick-action--indigo" },
];

const PROGRESS_BARS = [
  { label: "Active Properties", valueKey: ["properties", "active"], maxKey: ["properties", "total"], barCls: "ap-progress-bar--blue" },
  { label: "Published Blogs", valueKey: ["blogs", "published"], maxKey: ["blogs", "total"], barCls: "ap-progress-bar--emerald" },
  { label: "New Inquiries", valueKey: ["inquiries", "new"], maxKey: ["inquiries", "total"], barCls: "ap-progress-bar--amber" },
  { label: "Subscribers", valueKey: ["newsletter", "subscribers"], maxKey: null, barCls: "ap-progress-bar--violet" },
];

export default function AdminDashboard() {
  const { data, isLoading } = useSWR("/admin/stats");
  const stats = data?.data;

  const getVal = (obj, path) => path.reduce((o, k) => o?.[k], obj) ?? 0;

  return (
    <div className="ap-page-stack">
      <div>
        <h1 className="ap-title">Dashboard</h1>
        <p className="ap-subtitle">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {isLoading ? (
        <div className="ap-stat-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="ap-stat-skeleton" />)}
        </div>
      ) : (
        <div className="ap-stat-grid">
          {STAT_CARDS.map((card) => (
            <Link key={card.key} href={card.href} className={`ap-stat-card ${card.cls}`}>
              <div className="ap-stat-card__inner">
                <div>
                  <p className="ap-stat-card__label">{card.title}</p>
                  <p className="ap-stat-card__value">{card.getValue(stats)}</p>
                  <p className="ap-stat-card__sub">{card.getSub(stats)}</p>
                </div>
                <div className="ap-stat-card__icon">{card.icon}</div>
              </div>
              <div className="ap-stat-card__orb" />
            </Link>
          ))}
        </div>
      )}

      <div className="ap-panels-grid">
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h2 className="ap-card-title">Quick Actions</h2>
          <div className="ap-quick-grid">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href} className={`ap-quick-action ${action.cls}`}>
                <span className="ap-quick-action__emoji">{action.icon}</span>
                <span className="ap-quick-action__label">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h2 className="ap-card-title">Content Overview</h2>
          <div className="ap-progress-stack">
            {PROGRESS_BARS.map((item) => {
              const value = getVal(stats, item.valueKey);
              const max = item.maxKey ? Math.max(getVal(stats, item.maxKey), 1) : Math.max(value, 100);
              return (
                <div key={item.label} className="ap-progress-row">
                  <div className="ap-progress-meta">
                    <span>{item.label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="ap-progress-track">
                    <div
                      className={`ap-progress-bar ${item.barCls}`}
                      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: "1.5rem" }}>
        <h2 className="ap-card-title">Manage Site</h2>
        <div className="ap-site-grid">
          {[
            { label: "Hero Slides", href: "/admin/cms/hero", icon: "🖼️" },
            { label: "About page", href: "/admin/cms/about-page", icon: "ℹ️" },
            { label: "FAQs", href: "/admin/cms/faqs", icon: "❓" },
            { label: "Team agents", href: "/admin/cms/team-agents", icon: "👤" },
            { label: "Career page", href: "/admin/cms/career", icon: "💼" },
            { label: "Job postings", href: "/admin/cms/job-postings", icon: "📋" },
            { label: "Banners", href: "/admin/cms/banners", icon: "📢" },
            { label: "SEO", href: "/admin/seo", icon: "🔍" },
            { label: "Site Config", href: "/admin/site-config", icon: "⚙️" },
            { label: "Contact Info", href: "/admin/cms/contact-info", icon: "📞" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="ap-site-link">
              <span className="ap-site-link__emoji">{item.icon}</span>
              <span className="ap-site-link__label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

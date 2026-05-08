"use client";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import ImageUploader from "@/components/ui/ImageUploader";
import { mergeCareerPage } from "@/lib/careerPageDefaults";


function Field({ label, children }) {
  return (
    <div>
      <label className="ap-label">{label}</label>
      {children}
    </div>
  );
}

const TABS = [
  { id: "hero", label: "Hero", hint: "Top banner on /career" },
  { id: "jobs", label: "Jobs block", hint: "Headline above listings" },
  { id: "benefits", label: "Benefits", hint: "Perks & imagery" },
  { id: "reviews", label: "Reviews", hint: "Employee stories" },
];

export default function AdminCareerPage() {
  const { data, isLoading } = useSWR("/cms/career-page?raw=true");
  const [form, setForm] = useState(() => mergeCareerPage(null));
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("hero");

  useEffect(() => {
    if (data?.data) {
      setForm(mergeCareerPage(data.data));
    } else if (data && data.success && !data.data) {
      setForm(mergeCareerPage(null));
    }
  }, [data]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setBenefit = (i, field, v) => {
    setForm((p) => {
      const items = [...(p.benefitItems || [])];
      items[i] = { ...items[i], [field]: v };
      return { ...p, benefitItems: items };
    });
  };

  const addBenefit = () => {
    setForm((p) => ({
      ...p,
      benefitItems: [
        ...(p.benefitItems || []),
        { iconClass: "icon-heart-1", label: "" },
      ],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        key: "main",
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        heroBannerImage: form.heroBannerImage,
        jobsSectionTitle: form.jobsSectionTitle,
        jobsSectionSubtitle: form.jobsSectionSubtitle,
        jobsLoadMoreUrl: form.jobsLoadMoreUrl,
        benefitsTitle: form.benefitsTitle,
        benefitsPara1: form.benefitsPara1,
        benefitsPara2: form.benefitsPara2,
        benefitsImage1: form.benefitsImage1,
        benefitsImage2: form.benefitsImage2,
        benefitItems: (form.benefitItems || []).filter((b) => b.label?.trim()),
        benefitsCtaLabel: form.benefitsCtaLabel,
        benefitsCtaHref: form.benefitsCtaHref,
        reviewsTitle: form.reviewsTitle,
        reviewsPara1: form.reviewsPara1,
        reviewsPara2: form.reviewsPara2,
        reviewsPersonImage: form.reviewsPersonImage,
        reviewsSpotlightName: form.reviewsSpotlightName,
        reviewsSpotlightRole: form.reviewsSpotlightRole,
        reviewsSpotlightAvatar: form.reviewsSpotlightAvatar,
        reviewsCardQuote: form.reviewsCardQuote,
        reviewsCardName: form.reviewsCardName,
        reviewsCardRole: form.reviewsCardRole,
        reviewsCardAvatar: form.reviewsCardAvatar,
        reviewsMoreStoriesHref: form.reviewsMoreStoriesHref,
      };
      await api.put("/cms/career-page", payload);
      toast.success("Career page saved");
      mutate("/cms/career-page?raw=true");
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="ap-page-body">
        <p className="ap-title">Loading…</p>
      </div>
    );
  }

  const tabHint = TABS.find((x) => x.id === tab)?.hint;

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Career page</h1>
          <p className="ap-subtitle" style={{ marginTop: "0.25rem" }}>
            Edit <code>/career</code>. Benefit and review images use Firebase
            Storage; you can still paste any image URL.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ap-btn-primary"
        >
          {saving ? "Saving…" : "Save all"}
        </button>
      </div>

      <div className="ap-cms-intro">
        <p className="ap-cms-intro__title">How this works</p>
        <p className="ap-cms-intro__text">
          Empty fields fall back to theme defaults on the public site. Use tabs
          to focus on one section—click Save all when done.
        </p>
      </div>

      <div className="ap-cms-tabs" role="tablist" aria-label="Career sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`ap-cms-tab ${tab === t.id ? "ap-cms-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-1 text-color-3" style={{ margin: "-0.5rem 0 0.5rem" }}>
        {tabHint}
      </p>

      {tab === "hero" && (
        <div className="admin-card ap-form-stack mb-24">
          <div className="ap-cms-section-head">
            <div className="ap-cms-section-head__icon" aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div className="ap-cms-section-head__text">
              <h3>Hero</h3>
              <p>First screen visitors see</p>
            </div>
          </div>
          <Field label="Title">
            <input
              className="ap-input"
              value={form.heroTitle}
              onChange={(e) => setField("heroTitle", e.target.value)}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              className="ap-input"
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) => setField("heroSubtitle", e.target.value)}
            />
          </Field>
          <div>
            <label className="ap-label">Banner image</label>
            <p className="text-1 text-color-3" style={{ marginBottom: "0.5rem", fontSize: "0.8125rem" }}>
              Full-width hero at 320px height on /career. Firebase upload or URL; leave empty for default theme image.
            </p>
            <ImageUploader
              backend="firebase"
              folder="cms/career-page"
              value={form.heroBannerImage || ""}
              onChange={(url) => setField("heroBannerImage", url)}
              label="Upload banner"
            />
          </div>
        </div>
      )}

      {tab === "jobs" && (
        <div className="admin-card ap-form-stack mb-24">
          <div className="ap-cms-section-head">
            <div className="ap-cms-section-head__icon" aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <div className="ap-cms-section-head__text">
              <h3>Jobs section</h3>
              <p>Intro above job cards</p>
            </div>
          </div>
          <Field label="Section title">
            <input
              className="ap-input"
              value={form.jobsSectionTitle}
              onChange={(e) => setField("jobsSectionTitle", e.target.value)}
            />
          </Field>
          <Field label="Section subtitle">
            <textarea
              className="ap-input"
              rows={3}
              value={form.jobsSectionSubtitle}
              onChange={(e) => setField("jobsSectionSubtitle", e.target.value)}
            />
          </Field>
          <Field label="Load more button URL (optional)">
            <input
              className="ap-input"
              placeholder="https://..."
              value={form.jobsLoadMoreUrl}
              onChange={(e) => setField("jobsLoadMoreUrl", e.target.value)}
            />
          </Field>
        </div>
      )}

      {tab === "benefits" && (
        <div className="admin-card ap-form-stack mb-24">
          <div className="ap-cms-section-head">
            <div className="ap-cms-section-head__icon" aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <div className="ap-cms-section-head__text">
              <h3>Benefits</h3>
              <p>Copy, icons, two images</p>
            </div>
          </div>
          <Field label="Title (line break = second line)">
            <textarea
              className="ap-input"
              rows={2}
              value={form.benefitsTitle}
              onChange={(e) => setField("benefitsTitle", e.target.value)}
            />
          </Field>
          <Field label="Paragraph 1">
            <textarea
              className="ap-input"
              rows={3}
              value={form.benefitsPara1}
              onChange={(e) => setField("benefitsPara1", e.target.value)}
            />
          </Field>
          <Field label="Paragraph 2">
            <textarea
              className="ap-input"
              rows={2}
              value={form.benefitsPara2}
              onChange={(e) => setField("benefitsPara2", e.target.value)}
            />
          </Field>
          <div className="ap-grid-2col">
            <div>
              <label className="ap-label">Image 1</label>
              <ImageUploader
                backend="firebase"
                folder="cms/career-page"
                value={form.benefitsImage1}
                onChange={(url) => setField("benefitsImage1", url)}
                label="Upload image 1"
              />
            </div>
            <div>
              <label className="ap-label">Image 2</label>
              <ImageUploader
                backend="firebase"
                folder="cms/career-page"
                value={form.benefitsImage2}
                onChange={(url) => setField("benefitsImage2", url)}
                label="Upload image 2"
              />
            </div>
          </div>
          <p className="ap-label">Benefit rows</p>
          {(form.benefitItems || []).map((b, i) => (
            <div
              key={i}
              className="ap-grid-2col"
              style={{ marginBottom: "0.5rem" }}
            >
              <input
                className="ap-input"
                placeholder="icon class"
                value={b.iconClass || ""}
                onChange={(e) => setBenefit(i, "iconClass", e.target.value)}
              />
              <input
                className="ap-input"
                placeholder="Label"
                value={b.label || ""}
                onChange={(e) => setBenefit(i, "label", e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addBenefit} className="ap-btn-cancel">
            + Add benefit row
          </button>
          <div className="ap-grid-2col" style={{ marginTop: "0.75rem" }}>
            <Field label="CTA label">
              <input
                className="ap-input"
                value={form.benefitsCtaLabel}
                onChange={(e) => setField("benefitsCtaLabel", e.target.value)}
              />
            </Field>
            <Field label="CTA link">
              <input
                className="ap-input"
                value={form.benefitsCtaHref}
                onChange={(e) => setField("benefitsCtaHref", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="admin-card ap-form-stack mb-24">
          <div className="ap-cms-section-head">
            <div className="ap-cms-section-head__icon" aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div className="ap-cms-section-head__text">
              <h3>Reviews</h3>
              <p>Quotes and avatars</p>
            </div>
          </div>
          <Field label="Title">
            <input
              className="ap-input"
              value={form.reviewsTitle}
              onChange={(e) => setField("reviewsTitle", e.target.value)}
            />
          </Field>
          <Field label="Intro 1">
            <textarea
              className="ap-input"
              rows={3}
              value={form.reviewsPara1}
              onChange={(e) => setField("reviewsPara1", e.target.value)}
            />
          </Field>
          <Field label="Intro 2">
            <textarea
              className="ap-input"
              rows={2}
              value={form.reviewsPara2}
              onChange={(e) => setField("reviewsPara2", e.target.value)}
            />
          </Field>
          <Field label="More stories link">
            <input
              className="ap-input"
              value={form.reviewsMoreStoriesHref}
              onChange={(e) =>
                setField("reviewsMoreStoriesHref", e.target.value)
              }
            />
          </Field>
          <div>
            <label className="ap-label">Large person image</label>
            <ImageUploader
              backend="firebase"
              folder="cms/career-page"
              value={form.reviewsPersonImage}
              onChange={(url) => setField("reviewsPersonImage", url)}
              label="Upload hero person"
            />
          </div>
          <div className="ap-grid-2col">
            <Field label="Spotlight name">
              <input
                className="ap-input"
                value={form.reviewsSpotlightName}
                onChange={(e) =>
                  setField("reviewsSpotlightName", e.target.value)
                }
              />
            </Field>
            <Field label="Spotlight role">
              <input
                className="ap-input"
                value={form.reviewsSpotlightRole}
                onChange={(e) =>
                  setField("reviewsSpotlightRole", e.target.value)
                }
              />
            </Field>
          </div>
          <div>
            <label className="ap-label">Spotlight avatar</label>
            <ImageUploader
              backend="firebase"
              folder="cms/career-page"
              value={form.reviewsSpotlightAvatar}
              onChange={(url) => setField("reviewsSpotlightAvatar", url)}
              label="Upload avatar"
            />
          </div>
          <Field label="Quote text">
            <textarea
              className="ap-input"
              rows={4}
              value={form.reviewsCardQuote}
              onChange={(e) => setField("reviewsCardQuote", e.target.value)}
            />
          </Field>
          <div className="ap-grid-2col">
            <Field label="Quote author name">
              <input
                className="ap-input"
                value={form.reviewsCardName}
                onChange={(e) => setField("reviewsCardName", e.target.value)}
              />
            </Field>
            <Field label="Quote author role">
              <input
                className="ap-input"
                value={form.reviewsCardRole}
                onChange={(e) => setField("reviewsCardRole", e.target.value)}
              />
            </Field>
          </div>
          <div>
            <label className="ap-label">Quote author avatar</label>
            <ImageUploader
              backend="firebase"
              folder="cms/career-page"
              value={form.reviewsCardAvatar}
              onChange={(url) => setField("reviewsCardAvatar", url)}
              label="Upload avatar"
            />
          </div>
        </div>
      )}

      <div
        className="admin-card ap-form-stack mb-24"
        style={{ borderStyle: "dashed" }}
      >
        <div
          className="ap-form-footer"
          style={{ border: "none", paddingTop: 0 }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="ap-btn-save"
          >
            {saving ? "Saving…" : "Save all sections"}
          </button>
        </div>
      </div>
    </div>
  );
}

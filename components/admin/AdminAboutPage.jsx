"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { mergeAboutPage } from "@/lib/aboutPageDefaults";

function parseRows(raw, mode) {
  const lines = String(raw || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  return lines
    .map((line) => {
      const parts = line.split("|").map((x) => x.trim());
      if (mode === "stat") return { value: parts[0] || "", label: parts[1] || "", note: parts[2] || "" };
      if (mode === "text") return { title: parts[0] || "", description: parts[1] || "", tagline: parts[2] || "" };
      if (mode === "person") return { name: parts[0] || "", role: parts[1] || "", image: parts[2] || "" };
      if (mode === "timeline") return { year: parts[0] || "", title: parts[1] || "", description: parts[2] || "" };
      if (mode === "testimonial") return { quote: parts[0] || "", name: parts[1] || "", role: parts[2] || "" };
      return null;
    })
    .filter(Boolean);
}

function rowsToText(items, mode) {
  if (!Array.isArray(items)) return "";
  return items
    .map((item) => {
      if (mode === "stat") return `${item.value || ""} | ${item.label || ""} | ${item.note || ""}`.trim();
      if (mode === "text") return `${item.title || ""} | ${item.description || ""} | ${item.tagline || ""}`.trim();
      if (mode === "person") return `${item.name || ""} | ${item.role || ""} | ${item.image || ""}`.trim();
      if (mode === "timeline") return `${item.year || ""} | ${item.title || ""} | ${item.description || ""}`.trim();
      if (mode === "testimonial") return `${item.quote || ""} | ${item.name || ""} | ${item.role || ""}`.trim();
      return "";
    })
    .join("\n");
}

export default function AdminAboutPage() {
  const { data } = useSWR("/cms/about-page?raw=true");
  const [form, setForm] = useState(() => mergeAboutPage(null));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.data) setForm(mergeAboutPage(data.data));
    else if (data && data.success && !data.data) setForm(mergeAboutPage(null));
  }, [data]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/cms/about-page", form);
      toast.success("About page saved");
      mutate("/cms/about-page?raw=true");
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <div>
          <h1 className="ap-title">About Page</h1>
          <p className="ap-subtitle">Manage all sections of the public <code>/about</code> page.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="ap-btn-primary">
          {saving ? "Saving..." : "Save all"}
        </button>
      </div>

      <div className="admin-card ap-form-stack mb-24">
        <h3 className="ap-card-title">Hero</h3>
        <input className="ap-input" placeholder="Hero background image URL" value={form.heroBackgroundImage || ""} onChange={(e) => setField("heroBackgroundImage", e.target.value)} />
        <input className="ap-input" placeholder="Badge" value={form.heroBadge} onChange={(e) => setField("heroBadge", e.target.value)} />
        <input className="ap-input" placeholder="Title" value={form.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Subtitle" value={form.heroSubtitle} onChange={(e) => setField("heroSubtitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="Hero quote text" value={form.heroQuote || ""} onChange={(e) => setField("heroQuote", e.target.value)} />
        <input className="ap-input" placeholder="Hero quote author" value={form.heroQuoteAuthor || ""} onChange={(e) => setField("heroQuoteAuthor", e.target.value)} />
        <textarea className="ap-input" rows={4} placeholder={"Stats (value | label | note)\nExample: 39+ | Years experience | Since 1987"} value={rowsToText(form.heroStats, "stat")} onChange={(e) => setField("heroStats", parseRows(e.target.value, "stat"))} />
        <div className="ap-grid-2col">
          <input className="ap-input" placeholder="Primary CTA text" value={form.heroPrimaryCtaText} onChange={(e) => setField("heroPrimaryCtaText", e.target.value)} />
          <input className="ap-input" placeholder="Primary CTA link" value={form.heroPrimaryCtaLink} onChange={(e) => setField("heroPrimaryCtaLink", e.target.value)} />
        </div>
        <div className="ap-grid-2col">
          <input className="ap-input" placeholder="Secondary CTA text" value={form.heroSecondaryCtaText} onChange={(e) => setField("heroSecondaryCtaText", e.target.value)} />
          <input className="ap-input" placeholder="Secondary CTA link" value={form.heroSecondaryCtaLink} onChange={(e) => setField("heroSecondaryCtaLink", e.target.value)} />
        </div>
      </div>

      <div className="admin-card ap-form-stack mb-24">
        <h3 className="ap-card-title">Intro + Story</h3>
        <input className="ap-input" placeholder="Intro Eyebrow" value={form.introEyebrow} onChange={(e) => setField("introEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="Intro Title" value={form.introTitle} onChange={(e) => setField("introTitle", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Intro Description" value={form.introDescription} onChange={(e) => setField("introDescription", e.target.value)} />
        <textarea className="ap-input" rows={4} placeholder={"Intro highlights (label | note)"} value={rowsToText(form.introHighlights, "stat")} onChange={(e) => setField("introHighlights", parseRows(e.target.value, "stat"))} />
        <input className="ap-input" placeholder="Story Title" value={form.storyTitle} onChange={(e) => setField("storyTitle", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Story paragraph 1" value={form.storyParagraph1} onChange={(e) => setField("storyParagraph1", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Story paragraph 2" value={form.storyParagraph2} onChange={(e) => setField("storyParagraph2", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Story paragraph 3" value={form.storyParagraph3} onChange={(e) => setField("storyParagraph3", e.target.value)} />
      </div>

      <div className="admin-card ap-form-stack mb-24">
        <h3 className="ap-card-title">Leadership + Journey</h3>
        <input className="ap-input" placeholder="Leadership eyebrow" value={form.leadershipEyebrow} onChange={(e) => setField("leadershipEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="Leadership title" value={form.leadershipTitle} onChange={(e) => setField("leadershipTitle", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Leadership description" value={form.leadershipDescription} onChange={(e) => setField("leadershipDescription", e.target.value)} />
        <textarea className="ap-input" rows={4} placeholder={"Leaders (name | role | imageUrl)"} value={rowsToText(form.leaders, "person")} onChange={(e) => setField("leaders", parseRows(e.target.value, "person"))} />
        <input className="ap-input" placeholder="Journey eyebrow" value={form.journeyEyebrow} onChange={(e) => setField("journeyEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="Journey title" value={form.journeyTitle} onChange={(e) => setField("journeyTitle", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Journey description" value={form.journeyDescription} onChange={(e) => setField("journeyDescription", e.target.value)} />
        <textarea className="ap-input" rows={5} placeholder={"Timeline (year | title | description)"} value={rowsToText(form.journeyTimeline, "timeline")} onChange={(e) => setField("journeyTimeline", parseRows(e.target.value, "timeline"))} />
      </div>

      <div className="admin-card ap-form-stack mb-24">
        <h3 className="ap-card-title">Values + Mission + Why Choose</h3>
        <input className="ap-input" placeholder="Values title" value={form.valuesTitle} onChange={(e) => setField("valuesTitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="Values description" value={form.valuesDescription} onChange={(e) => setField("valuesDescription", e.target.value)} />
        <textarea className="ap-input" rows={4} placeholder={"Values (title | description | optional tagline)"} value={rowsToText(form.values, "text")} onChange={(e) => setField("values", parseRows(e.target.value, "text"))} />
        <input className="ap-input" placeholder="Mission eyebrow" value={form.missionEyebrow} onChange={(e) => setField("missionEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="Mission section title" value={form.missionTitle} onChange={(e) => setField("missionTitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="Mission section description" value={form.missionDescription} onChange={(e) => setField("missionDescription", e.target.value)} />
        <div className="ap-grid-2col">
          <input className="ap-input" placeholder="Mission heading" value={form.missionHeading} onChange={(e) => setField("missionHeading", e.target.value)} />
          <input className="ap-input" placeholder="Vision heading" value={form.visionHeading} onChange={(e) => setField("visionHeading", e.target.value)} />
        </div>
        <textarea className="ap-input" rows={3} placeholder="Mission text" value={form.missionText} onChange={(e) => setField("missionText", e.target.value)} />
        <textarea className="ap-input" rows={3} placeholder="Vision text" value={form.visionText} onChange={(e) => setField("visionText", e.target.value)} />
        <input className="ap-input" placeholder="Why choose eyebrow" value={form.whyChooseEyebrow} onChange={(e) => setField("whyChooseEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="Why choose title" value={form.whyChooseTitle} onChange={(e) => setField("whyChooseTitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="Why choose description" value={form.whyChooseDescription} onChange={(e) => setField("whyChooseDescription", e.target.value)} />
        <textarea className="ap-input" rows={5} placeholder={"Why choose items (title | description | tagline)"} value={rowsToText(form.whyChooseItems, "text")} onChange={(e) => setField("whyChooseItems", parseRows(e.target.value, "text"))} />
      </div>

      <div className="admin-card ap-form-stack mb-24">
        <h3 className="ap-card-title">Testimonials + CTA</h3>
        <input className="ap-input" placeholder="Testimonials eyebrow" value={form.testimonialsEyebrow} onChange={(e) => setField("testimonialsEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="Testimonials title" value={form.testimonialsTitle} onChange={(e) => setField("testimonialsTitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="Testimonials description" value={form.testimonialsDescription} onChange={(e) => setField("testimonialsDescription", e.target.value)} />
        <textarea className="ap-input" rows={5} placeholder={"Testimonials (quote | name | role)"} value={rowsToText(form.testimonials, "testimonial")} onChange={(e) => setField("testimonials", parseRows(e.target.value, "testimonial"))} />
        <input className="ap-input" placeholder="CTA eyebrow" value={form.ctaEyebrow} onChange={(e) => setField("ctaEyebrow", e.target.value)} />
        <input className="ap-input" placeholder="CTA title" value={form.ctaTitle} onChange={(e) => setField("ctaTitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="CTA description" value={form.ctaDescription} onChange={(e) => setField("ctaDescription", e.target.value)} />
        <div className="ap-grid-2col">
          <input className="ap-input" placeholder="CTA button text" value={form.ctaButtonText} onChange={(e) => setField("ctaButtonText", e.target.value)} />
          <input className="ap-input" placeholder="CTA button link" value={form.ctaButtonLink} onChange={(e) => setField("ctaButtonLink", e.target.value)} />
        </div>
        <input className="ap-input" placeholder="Footer CTA title" value={form.footerCtaTitle || ""} onChange={(e) => setField("footerCtaTitle", e.target.value)} />
        <textarea className="ap-input" rows={2} placeholder="Footer CTA description" value={form.footerCtaDescription || ""} onChange={(e) => setField("footerCtaDescription", e.target.value)} />
        <div className="ap-grid-2col">
          <input className="ap-input" placeholder="Footer primary button text" value={form.footerPrimaryButtonText || ""} onChange={(e) => setField("footerPrimaryButtonText", e.target.value)} />
          <input className="ap-input" placeholder="Footer primary button link" value={form.footerPrimaryButtonLink || ""} onChange={(e) => setField("footerPrimaryButtonLink", e.target.value)} />
        </div>
        <div className="ap-grid-2col">
          <input className="ap-input" placeholder="Footer secondary button text" value={form.footerSecondaryButtonText || ""} onChange={(e) => setField("footerSecondaryButtonText", e.target.value)} />
          <input className="ap-input" placeholder="Footer secondary button link" value={form.footerSecondaryButtonLink || ""} onChange={(e) => setField("footerSecondaryButtonLink", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

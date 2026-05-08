"use client";
import { useState } from "react";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

const PAGES = [
  { page: "home", label: "Home Page" },
  { page: "properties", label: "Properties Listing" },
  { page: "blog", label: "Blog Listing" },
  { page: "contact", label: "Contact Page" },
  { page: "about", label: "About Page" },
  { page: "compare", label: "Compare Page" },
  { page: "team", label: "Team Page" },
  { page: "career", label: "Career Page" },
  { page: "faq", label: "FAQ Page" },
  { page: "home-loan-process", label: "Home Loan Process" },
];

function SEOPageEditor({ pageSlug, pageLabel }) {
  const { data, mutate } = useSWR(`/seo/${pageSlug}`, fetcher);
  const existing = data?.data;
  const [form, setForm] = useState({ title: "", description: "", keywords: "", ogImage: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (data && !loaded) {
    setForm({ title: existing?.title || "", description: existing?.description || "", keywords: existing?.keywords || "", ogImage: existing?.ogImage || "" });
    setLoaded(true);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/seo/${pageSlug}`, form);
      toast.success(`SEO saved for ${pageLabel}`);
      mutate();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="admin-card ap-seo-card" style={{ padding: "1.25rem" }}>
      <h3 className="ap-seo-card-title">{pageLabel}</h3>
      <div className="ap-grid-2col">
        <div className="ap-col-full"><label className="ap-label">Meta Title</label><input className="ap-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder={`${pageLabel} | Proty Real Estate`} /></div>
        <div className="ap-col-full"><label className="ap-label">Meta Description</label><textarea className="ap-input" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
        <div><label className="ap-label">Keywords</label><input className="ap-input" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="comma, separated" /></div>
        <div><label className="ap-label">OG Image URL</label><input className="ap-input" value={form.ogImage} onChange={(e) => setForm((p) => ({ ...p, ogImage: e.target.value }))} /></div>
      </div>
      <div className="ap-save-row">
        <button onClick={handleSave} disabled={saving} className="ap-btn-save">{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}

export default function AdminSEO() {
  return (
    <div className="ap-page-body">
      <div className="ap-header--col ap-header">
        <h1 className="ap-title">SEO Management</h1>
        <p className="ap-subtitle">Manage meta titles, descriptions, and keywords for each page.</p>
      </div>
      <div className="ap-seo-stack">
        {PAGES.map((p) => <SEOPageEditor key={p.page} pageSlug={p.page} pageLabel={p.label} />)}
      </div>
    </div>
  );
}

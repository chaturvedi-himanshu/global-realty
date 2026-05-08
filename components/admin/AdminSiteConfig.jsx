"use client";
import { useState, useEffect } from "react";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import ImageUploader from "@/components/ui/ImageUploader";

const fetcher = (url) => api.get(url).then((r) => r.data);

const DEFAULT_FOOTER_LINKS = [
  { label: "Contact", href: "/contact", active: true },
  { label: "Our team", href: "/team", active: true },
  { label: "Careers", href: "/career", active: true },
  { label: "FAQs", href: "/faq", active: true },
  { label: "Blog", href: "/blogs", active: true },
  { label: "Compare", href: "/compare", active: true },
];

const DEFAULTS = {
  siteName: "Proty Real Estate",
  siteTagline: "Find Your Dream Property",
  logo: "",
  favicon: "",
  footerText: "© 2024 Proty. All rights reserved.",
  footerNavLinks: DEFAULT_FOOTER_LINKS,
  socialFacebook: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialInstagram: "",
  googleAnalyticsId: "",
  facebookPixelId: "",
};

export default function AdminSiteConfig() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const { data } = useSWR("/site-config", fetcher);

  useEffect(() => {
    if (data?.data) {
      setForm((prev) => {
        const next = { ...prev, ...data.data };
        if (!Array.isArray(next.footerNavLinks)) {
          next.footerNavLinks = DEFAULT_FOOTER_LINKS;
        }
        return next;
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { primaryColor: _ignored, ...payload } = form;
      await api.put("/site-config", payload);
      toast.success("Config saved");
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Site Configuration</h1>
        <button onClick={handleSave} disabled={saving} className="ap-btn-save" style={{ padding: "0.5rem 1.25rem" }}>{saving ? "Saving..." : "Save Config"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div className="admin-card" style={{ padding: "1.5rem" }}>
            <h3 className="ap-card-title">General</h3>
            <div className="ap-form-stack">
              <div><label className="ap-label">Site Name</label><input className="ap-input" value={form.siteName} onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))} /></div>
              <div><label className="ap-label">Tagline</label><input className="ap-input" value={form.siteTagline} onChange={(e) => setForm((p) => ({ ...p, siteTagline: e.target.value }))} /></div>
              <div><label className="ap-label">Footer Text</label><input className="ap-input" value={form.footerText} onChange={(e) => setForm((p) => ({ ...p, footerText: e.target.value }))} /></div>
              <p className="text-sm" style={{ color: "#6b7280", margin: 0 }}>
                Site primary color is fixed in theme SCSS / <code>lib/brandPrimary.js</code> (not edited here).
              </p>
            </div>
          </div>
          <div className="admin-card" style={{ padding: "1.5rem" }}>
            <h3 className="ap-card-title">Logo & Favicon</h3>
            <div className="ap-form-stack">
              <div><label className="ap-label">Logo</label><ImageUploader value={form.logo} onChange={(url) => setForm((p) => ({ ...p, logo: url }))} folder="proty/brand" /></div>
              <div><label className="ap-label">Favicon</label><ImageUploader value={form.favicon} onChange={(url) => setForm((p) => ({ ...p, favicon: url }))} folder="proty/brand" /></div>
            </div>
          </div>
          <div className="admin-card" style={{ padding: "1.5rem" }}>
            <h3 className="ap-card-title">Analytics</h3>
            <div className="ap-form-stack">
              <div><label className="ap-label">Google Analytics ID</label><input className="ap-input" value={form.googleAnalyticsId} onChange={(e) => setForm((p) => ({ ...p, googleAnalyticsId: e.target.value }))} placeholder="G-XXXXXXXXXX" /></div>
              <div><label className="ap-label">Facebook Pixel ID</label><input className="ap-input" value={form.facebookPixelId} onChange={(e) => setForm((p) => ({ ...p, facebookPixelId: e.target.value }))} /></div>
            </div>
          </div>
          <div className="admin-card" style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
            <h3 className="ap-card-title">Footer &amp; social (website)</h3>
            <p className="text-sm" style={{ color: "#6b7280", marginTop: 0 }}>
              Social URLs must start with https://. Footer links must start with /.
            </p>
            <div className="ap-form-stack" style={{ marginBottom: "1rem" }}>
              <div><label className="ap-label">Facebook</label><input className="ap-input" value={String(form.socialFacebook || "")} onChange={(e) => setForm((p) => ({ ...p, socialFacebook: e.target.value }))} placeholder="https://..." /></div>
              <div><label className="ap-label">X (Twitter)</label><input className="ap-input" value={String(form.socialTwitter || "")} onChange={(e) => setForm((p) => ({ ...p, socialTwitter: e.target.value }))} placeholder="https://..." /></div>
              <div><label className="ap-label">LinkedIn</label><input className="ap-input" value={String(form.socialLinkedin || "")} onChange={(e) => setForm((p) => ({ ...p, socialLinkedin: e.target.value }))} placeholder="https://..." /></div>
              <div><label className="ap-label">Instagram</label><input className="ap-input" value={String(form.socialInstagram || "")} onChange={(e) => setForm((p) => ({ ...p, socialInstagram: e.target.value }))} placeholder="https://..." /></div>
            </div>
            <h4 className="ap-card-title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Footer page links</h4>
            <div className="ap-form-stack" style={{ gap: "0.5rem" }}>
              {(Array.isArray(form.footerNavLinks) ? form.footerNavLinks : DEFAULT_FOOTER_LINKS).map((row, i) => (
                <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <input className="ap-input" style={{ flex: "1", minWidth: "120px" }} placeholder="Label" value={row.label} onChange={(e) => {
                    const list = [...(Array.isArray(form.footerNavLinks) ? form.footerNavLinks : DEFAULT_FOOTER_LINKS)];
                    list[i] = { ...list[i], label: e.target.value };
                    setForm((p) => ({ ...p, footerNavLinks: list }));
                  }} />
                  <input className="ap-input" style={{ flex: "1", minWidth: "140px" }} placeholder="/path" value={row.href} onChange={(e) => {
                    const list = [...(Array.isArray(form.footerNavLinks) ? form.footerNavLinks : DEFAULT_FOOTER_LINKS)];
                    list[i] = { ...list[i], href: e.target.value };
                    setForm((p) => ({ ...p, footerNavLinks: list }));
                  }} />
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap" }}>
                    <input type="checkbox" checked={row.active !== false} onChange={(e) => {
                      const list = [...(Array.isArray(form.footerNavLinks) ? form.footerNavLinks : DEFAULT_FOOTER_LINKS)];
                      list[i] = { ...list[i], active: e.target.checked };
                      setForm((p) => ({ ...p, footerNavLinks: list }));
                    }} />
                    Active
                  </label>
                  <button type="button" className="ap-btn-save" style={{ padding: "0.35rem 0.75rem", background: "#fee2e2", color: "#991b1b" }} onClick={() => {
                    const list = (Array.isArray(form.footerNavLinks) ? form.footerNavLinks : [...DEFAULT_FOOTER_LINKS]).filter((_, j) => j !== i);
                    setForm((p) => ({ ...p, footerNavLinks: list }));
                  }}>Remove</button>
                </div>
              ))}
              <button type="button" className="ap-btn-save" style={{ padding: "0.5rem 1rem", alignSelf: "flex-start" }} onClick={() => {
                const list = [...(Array.isArray(form.footerNavLinks) ? form.footerNavLinks : DEFAULT_FOOTER_LINKS), { label: "", href: "/", active: true }];
                setForm((p) => ({ ...p, footerNavLinks: list }));
              }}>Add link</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

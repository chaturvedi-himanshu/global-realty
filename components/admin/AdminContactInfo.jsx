"use client";
import { useState, useEffect } from "react";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import ImageUploader from "@/components/ui/ImageUploader";

const fetcher = (url) => api.get(url).then((r) => r.data);

const EMPTY = {
  phones: [""],
  emails: [""],
  address: "",
  mapEmbedUrl: "",
  workingHours: "Mon-Sat: 9am - 6pm",
  contactPageImage: "",
  contactAboutTitle: "",
  contactAboutSubtitle: "",
  aboutPageHeroTitle: "",
  aboutPageHeroSubtitle: "",
  aboutPageHeroBanner: "",
  socialLinks: { facebook: "", instagram: "", linkedin: "", youtube: "", twitter: "", whatsapp: "" },
};

export default function AdminContactInfo() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { data } = useSWR("/cms/contact-info", fetcher);

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      setForm({
        phones: d.phones?.length ? d.phones : [""],
        emails: d.emails?.length ? d.emails : [""],
        address: d.address || "",
        mapEmbedUrl: d.mapEmbedUrl || "",
        workingHours: d.workingHours || "Mon-Sat: 9am - 6pm",
        contactPageImage: d.contactPageImage || "",
        contactAboutTitle: d.contactAboutTitle || "",
        contactAboutSubtitle: d.contactAboutSubtitle || "",
        aboutPageHeroTitle: d.aboutPageHeroTitle || "",
        aboutPageHeroSubtitle: d.aboutPageHeroSubtitle || "",
        aboutPageHeroBanner: d.aboutPageHeroBanner || "",
        socialLinks: { ...EMPTY.socialLinks, ...(d.socialLinks || {}) },
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/cms/contact-info", { ...form, phones: form.phones.filter(Boolean), emails: form.emails.filter(Boolean) });
      toast.success("Contact info saved");
    } catch {} finally { setSaving(false); }
  };

  const updateList = (key, index, value) => setForm((prev) => { const arr = [...prev[key]]; arr[index] = value; return { ...prev, [key]: arr }; });
  const addItem = (key) => setForm((p) => ({ ...p, [key]: [...p[key], ""] }));
  const removeItem = (key, i) => setForm((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Contact Info</h1>
        <button onClick={handleSave} disabled={saving} className="ap-btn-save" style={{ padding: "0.5rem 1.25rem" }}>{saving ? "Saving..." : "Save Changes"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 className="ap-card-title">Contact Details</h3>
          <div className="ap-form-stack">
            <div>
              <label className="ap-label">Phone Numbers</label>
              {form.phones.map((phone, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input className="ap-input" style={{ flex: 1 }} value={phone} onChange={(e) => updateList("phones", i, e.target.value)} placeholder="+91 ..." />
                  {form.phones.length > 1 && <button onClick={() => removeItem("phones", i)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem" }}>×</button>}
                </div>
              ))}
              <button onClick={() => addItem("phones")} className="ap-text-link">+ Add phone</button>
            </div>
            <div>
              <label className="ap-label">Email Addresses</label>
              {form.emails.map((email, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input className="ap-input" style={{ flex: 1 }} value={email} onChange={(e) => updateList("emails", i, e.target.value)} placeholder="email@example.com" />
                  {form.emails.length > 1 && <button onClick={() => removeItem("emails", i)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem" }}>×</button>}
                </div>
              ))}
              <button onClick={() => addItem("emails")} className="ap-text-link">+ Add email</button>
            </div>
            <div><label className="ap-label">Address</label><textarea className="ap-input" rows={3} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
            <div><label className="ap-label">Working Hours</label><input className="ap-input" value={form.workingHours} onChange={(e) => setForm((p) => ({ ...p, workingHours: e.target.value }))} /></div>
            <div><label className="ap-label">Google Map Embed URL</label><input className="ap-input" value={form.mapEmbedUrl} onChange={(e) => setForm((p) => ({ ...p, mapEmbedUrl: e.target.value }))} placeholder="https://maps.google.com/embed?..." /></div>
            <div>
              <label className="ap-label">Contact page — heading</label>
              <input className="ap-input" value={form.contactAboutTitle} onChange={(e) => setForm((p) => ({ ...p, contactAboutTitle: e.target.value }))} placeholder="Shown next to the contact image (optional)" />
            </div>
            <div>
              <label className="ap-label">Contact page — intro text</label>
              <textarea className="ap-input" rows={3} value={form.contactAboutSubtitle} onChange={(e) => setForm((p) => ({ ...p, contactAboutSubtitle: e.target.value }))} placeholder="Short paragraph under the heading" />
            </div>
            <div>
              <label className="ap-label">Contact page image</label>
              <p className="text-1" style={{ marginBottom: "0.5rem", fontSize: "0.875rem", opacity: 0.85 }}>Recommended ~550×560px or similar; displays in a fixed aspect frame on /contact.</p>
              <ImageUploader
                folder="cms/contact"
                label="Upload image"
                value={form.contactPageImage}
                onChange={(url) => setForm((p) => ({ ...p, contactPageImage: url }))}
              />
            </div>
            <div>
              <label className="ap-label">About page — hero title</label>
              <input className="ap-input" value={form.aboutPageHeroTitle} onChange={(e) => setForm((p) => ({ ...p, aboutPageHeroTitle: e.target.value }))} placeholder="About Us" />
            </div>
            <div>
              <label className="ap-label">About page — hero subtitle</label>
              <textarea className="ap-input" rows={3} value={form.aboutPageHeroSubtitle} onChange={(e) => setForm((p) => ({ ...p, aboutPageHeroSubtitle: e.target.value }))} placeholder="Short text under about page heading" />
            </div>
            <div>
              <label className="ap-label">About page — hero banner image</label>
              <ImageUploader
                folder="cms/about"
                label="Upload banner"
                value={form.aboutPageHeroBanner}
                onChange={(url) => setForm((p) => ({ ...p, aboutPageHeroBanner: url }))}
              />
            </div>
          </div>
        </div>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 className="ap-card-title">Social Media Links</h3>
          <div className="ap-form-stack">
            {Object.entries(form.socialLinks).map(([key, val]) => (
              <div key={key}>
                <label className="ap-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input className="ap-input" value={val} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))} placeholder={`https://${key}.com/...`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

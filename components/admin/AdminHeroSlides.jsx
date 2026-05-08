"use client";
import { useState } from "react";
import { useEffect } from "react";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import ImageUploader from "@/components/ui/ImageUploader";
import api from "@/lib/axios";

const heroListKey = "/cms/hero?all=true";
const fetcher = (url) => api.get(url).then((r) => r.data);

const EMPTY = { title: "", subtitle: "", backgroundImage: "", ctaText: "Explore Properties", ctaLink: "/properties", order: 0, isActive: true };

export default function AdminHeroSlides() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [heroBadgeImage, setHeroBadgeImage] = useState("");
  const [heroStats, setHeroStats] = useState([]);

  const { data, isLoading, mutate: refreshSlides } = useSWR(heroListKey, fetcher);
  const { data: siteConfigData } = useSWR("/site-config", fetcher);

  useEffect(() => {
    const cfg = siteConfigData?.data;
    if (!cfg) return;
    setHeroBadgeImage(typeof cfg.heroBadgeImage === "string" ? cfg.heroBadgeImage : "");
    setHeroStats(Array.isArray(cfg.heroStats) ? cfg.heroStats : []);
  }, [siteConfigData]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ title: r.title, subtitle: r.subtitle || "", backgroundImage: r.backgroundImage || "", ctaText: r.ctaText, ctaLink: r.ctaLink, order: r.order, isActive: r.isActive }); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      editing
        ? await api.put(`/cms/hero/${String(editing._id)}`, form)
        : await api.post("/cms/hero", form);
      toast.success(editing ? "Updated" : "Created");
      await refreshSlides();
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/cms/hero/${id}`);
    toast.success("Deleted");
    await refreshSlides();
  };

  const saveHeroSettings = async () => {
    setSettingsSaving(true);
    try {
      await api.put("/site-config", { heroBadgeImage, heroStats });
      toast.success("Hero settings saved");
    } catch {} finally { setSettingsSaving(false); }
  };

  const columns = [
    { key: "order", label: "Order" },
    { key: "backgroundImage", label: "Image", render: (r) => r.backgroundImage ? <img src={r.backgroundImage} className="ap-thumb" /> : "—" },
    { key: "title", label: "Title" },
    { key: "ctaText", label: "CTA Text" },
    { key: "isActive", label: "Active", render: (r) => r.isActive ? <span className="ap-check">✓</span> : <span className="ap-cross">✗</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="ap-btn-row">
        <button onClick={() => openEdit(r)} className="ap-btn-edit">Edit</button>
        <button onClick={() => handleDelete(r._id)} className="ap-btn-delete">Delete</button>
      </div>
    )},
  ];

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Hero Slides</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add Slide</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <div className="admin-card" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 className="ap-card-title" style={{ margin: 0 }}>Hero Badge & Stats</h3>
          <button onClick={saveHeroSettings} disabled={settingsSaving} className="ap-btn-save" style={{ padding: "0.5rem 1rem" }}>
            {settingsSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <div className="ap-form-stack">
          <div>
            <label className="ap-label">Hero Badge Image (right-side circular style)</label>
            <ImageUploader value={heroBadgeImage} onChange={setHeroBadgeImage} folder="proty/hero" />
          </div>
          <div>
            <label className="ap-label">Hero Stats</label>
            <div className="ap-form-stack" style={{ gap: "0.5rem" }}>
              {(Array.isArray(heroStats) ? heroStats : []).map((row, i) => (
                <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <input className="ap-input" style={{ flex: 1, minWidth: "180px" }} placeholder="Label" value={String(row?.label || "")} onChange={(e) => {
                    const list = [...heroStats];
                    list[i] = { ...list[i], label: e.target.value };
                    setHeroStats(list);
                  }} />
                  <input type="number" className="ap-input" style={{ width: "140px" }} placeholder="Value" value={String(row?.value ?? "")} onChange={(e) => {
                    const list = [...heroStats];
                    list[i] = { ...list[i], value: Number(e.target.value || 0) };
                    setHeroStats(list);
                  }} />
                  <input className="ap-input" style={{ width: "110px" }} placeholder="Suffix" value={String(row?.suffix || "")} onChange={(e) => {
                    const list = [...heroStats];
                    list[i] = { ...list[i], suffix: e.target.value };
                    setHeroStats(list);
                  }} />
                  <button type="button" className="ap-btn-save" style={{ padding: "0.35rem 0.7rem", background: "#fee2e2", color: "#991b1b" }} onClick={() => {
                    setHeroStats(heroStats.filter((_, j) => j !== i));
                  }}>Remove</button>
                </div>
              ))}
              <button type="button" className="ap-btn-save" style={{ padding: "0.5rem 0.9rem", alignSelf: "flex-start" }} onClick={() => setHeroStats([...(Array.isArray(heroStats) ? heroStats : []), { label: "", value: 0, suffix: "+" }])}>
                Add Stat
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Slide" : "Add Slide"} size="lg">
        <div className="ap-form-stack">
          <div><label className="ap-label">Title (optional)</label><input className="ap-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
          <div><label className="ap-label">Subtitle</label><input className="ap-input" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} /></div>
          <div><label className="ap-label">Background Image</label><ImageUploader value={form.backgroundImage} onChange={(url) => setForm((p) => ({ ...p, backgroundImage: url }))} folder="proty/hero" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="ap-label">CTA Text</label><input className="ap-input" value={form.ctaText} onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))} /></div>
            <div><label className="ap-label">CTA Link</label><input className="ap-input" value={form.ctaLink} onChange={(e) => setForm((p) => ({ ...p, ctaLink: e.target.value }))} /></div>
          </div>
          <div><label className="ap-label">Order</label><input type="number" className="ap-input" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} /></div>
          <label className="ap-checkbox-row"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} /><span className="ap-checkbox-label">Active</span></label>
          <div className="ap-form-footer">
            <button onClick={() => setModal(false)} className="ap-btn-cancel">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="ap-btn-save">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import ImageUploader from "@/components/ui/ImageUploader";


export default function AdminAboutSection() {
  const [form, setForm] = useState({ title: "", description: "", image: "", stats: [], isActive: true });
  const [saving, setSaving] = useState(false);
  const [newStat, setNewStat] = useState({ label: "", value: "" });

  const { data } = useSWR("/cms/about");

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      setForm({ title: d.title || "", description: d.description || "", image: d.image || "", stats: d.stats || [], isActive: d.isActive ?? true });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/cms/about", form);
      toast.success("About section saved");
    } catch {} finally { setSaving(false); }
  };

  const addStat = () => {
    if (!newStat.label || !newStat.value) return;
    setForm((p) => ({ ...p, stats: [...p.stats, { ...newStat }] }));
    setNewStat({ label: "", value: "" });
  };

  const removeStat = (i) => setForm((p) => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }));

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">About Section</h1>
        <button onClick={handleSave} disabled={saving} className="ap-btn-save" style={{ padding: "0.5rem 1.25rem" }}>{saving ? "Saving..." : "Save Changes"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <div className="ap-form-stack">
            <div><label className="ap-label">Title</label><input className="ap-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="ap-label">Description</label><textarea className="ap-input" rows={5} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
            <div>
              <label className="ap-label">Stats</label>
              <div className="ap-add-stat-row">
                <input className="ap-input" style={{ flex: 1 }} placeholder="Label (e.g. Properties)" value={newStat.label} onChange={(e) => setNewStat((p) => ({ ...p, label: e.target.value }))} />
                <input className="ap-input" style={{ flex: 1 }} placeholder="Value (e.g. 500+)" value={newStat.value} onChange={(e) => setNewStat((p) => ({ ...p, value: e.target.value }))} />
                <button onClick={addStat} className="ap-btn-save" style={{ whiteSpace: "nowrap", padding: "0.5rem 0.75rem" }}>Add</button>
              </div>
              <div className="ap-stats-list">
                {form.stats.map((stat, i) => (
                  <div key={i} className="ap-stat-row">
                    <span className="ap-stat-row__label">{stat.label}</span>
                    <span className="ap-stat-row__value">{stat.value}</span>
                    <button onClick={() => removeStat(i)} className="ap-stat-row__remove">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <div className="ap-form-stack">
            <div><label className="ap-label">Section Image</label><ImageUploader value={form.image} onChange={(url) => setForm((p) => ({ ...p, image: url }))} folder="proty/about" /></div>
            <label className="ap-checkbox-row"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} /><span className="ap-checkbox-label">Active</span></label>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import ImageUploader from "@/components/ui/ImageUploader";
import api from "@/lib/axios";

const EMPTY = {
  name: "",
  designation: "",
  company: "",
  avatar: "",
  brandLogo: "",
  video: "",
  message: "",
  rating: 5,
  isApproved: true,
  isActive: true,
};

export default function AdminTestimonials() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/cms/testimonials?all=true");

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      name: r.name || "",
      designation: r.designation || r.role || "",
      company: r.company || "",
      avatar: r.avatar || "",
      brandLogo: r.brandLogo || "",
      video: r.video || "",
      message: r.message || "",
      rating: r.rating,
      isApproved: r.isApproved,
      isActive: r.isActive,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.designation?.trim()) {
      toast.error("Designation is required");
      return;
    }
    if (!form.video?.trim() && !form.message?.trim()) {
      toast.error("Add a testimonial video URL or a written message");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        designation: form.designation.trim(),
        role: form.designation.trim(),
        message: form.message.trim(),
        video: form.video.trim(),
        brandLogo: String(form.brandLogo || "").trim(),
      };
      editing ? await api.put(`/cms/testimonials/${editing._id}`, payload) : await api.post("/cms/testimonials", payload);
      toast.success(editing ? "Updated" : "Created");
      mutate("/cms/testimonials?all=true");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/cms/testimonials/${id}`);
    toast.success("Deleted");
    mutate("/cms/testimonials?all=true");
  };

  const columns = [
    { key: "media", label: "Media", render: (r) =>
      r.video
        ? <span className="ap-check" title="Has video">▶</span>
        : r.avatar
          ? <img src={r.avatar} className="ap-avatar" alt="" />
          : <div className="ap-avatar-placeholder">{r.name[0]}</div>
    },
    { key: "name", label: "Name" },
    { key: "designation", label: "Designation", render: (r) =>
      `${r.designation || r.role || ""}${r.company ? ` • ${r.company}` : ""}`
    },
    { key: "rating", label: "Rating", render: (r) => "⭐".repeat(r.rating) },
    { key: "isApproved", label: "Approved", render: (r) => r.isApproved ? <span className="ap-check">✓</span> : <span className="ap-cross">✗</span> },
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
        <h1 className="ap-title">Testimonials</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Testimonial" : "Add Testimonial"}>
        <div className="ap-form-stack">
          <div><label className="ap-label">Name *</label><input className="ap-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="ap-label">Designation *</label><input className="ap-input" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} placeholder="e.g. Home buyer" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="ap-label">Company (optional)</label><input className="ap-input" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} /></div>
            <div><label className="ap-label">Photo (optional)</label><ImageUploader value={form.avatar} onChange={(url) => setForm((p) => ({ ...p, avatar: url }))} folder="proty/avatars" /></div>
          </div>
          <div>
            <label className="ap-label">Brand logo URL (optional)</label>
            <input className="ap-input" value={form.brandLogo} onChange={(e) => setForm((p) => ({ ...p, brandLogo: e.target.value }))} placeholder="Top-right logo on video card" />
          </div>
          <div>
            <label className="ap-label">Video URL</label>
            <input className="ap-input" value={form.video} onChange={(e) => setForm((p) => ({ ...p, video: e.target.value }))} placeholder="https://… (MP4/WebM) — or use written message below" />
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.35rem" }}>Either a video URL or written message is required. For file upload, use the main admin dashboard.</p>
          </div>
          <div><label className="ap-label">Written message (optional)</label><textarea className="ap-input" rows={3} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} /></div>
          <div>
            <label className="ap-label">Rating</label>
            <select className="ap-input" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}>
              {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
            </select>
          </div>
          <div className="ap-checkbox-multi">
            <label className="ap-checkbox-row"><input type="checkbox" checked={form.isApproved} onChange={(e) => setForm((p) => ({ ...p, isApproved: e.target.checked }))} /><span className="ap-checkbox-label">Approved</span></label>
            <label className="ap-checkbox-row"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} /><span className="ap-checkbox-label">Active</span></label>
          </div>
          <div className="ap-form-footer">
            <button onClick={() => setModal(false)} className="ap-btn-cancel">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="ap-btn-save">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

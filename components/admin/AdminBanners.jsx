"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import ImageUploader from "@/components/ui/ImageUploader";
import api from "@/lib/axios";

const EMPTY = { title: "", subtitle: "", image: "", link: "", position: "home", isActive: true, order: 0 };

export default function AdminBanners() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/cms/banners?all=true");

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ title: r.title, subtitle: r.subtitle || "", image: r.image || "", link: r.link || "", position: r.position, isActive: r.isActive, order: r.order }); setModal(true); };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/cms/banners/${editing._id}`, form) : await api.post("/cms/banners", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/cms/banners?all=true");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/cms/banners/${id}`);
    toast.success("Deleted");
    mutate("/cms/banners?all=true");
  };

  const columns = [
    { key: "image", label: "Image", render: (r) => r.image ? <img src={r.image} className="ap-thumb" /> : "—" },
    { key: "title", label: "Title" },
    { key: "position", label: "Position", render: (r) => <span style={{ textTransform: "capitalize" }}>{r.position}</span> },
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
        <h1 className="ap-title">Banners</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add Banner</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Banner" : "Add Banner"}>
        <div className="ap-form-stack">
          <div><label className="ap-label">Title *</label><input className="ap-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
          <div><label className="ap-label">Subtitle</label><input className="ap-input" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} /></div>
          <div><label className="ap-label">Banner Image</label><ImageUploader value={form.image} onChange={(url) => setForm((p) => ({ ...p, image: url }))} folder="proty/banners" /></div>
          <div><label className="ap-label">Link URL</label><input className="ap-input" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} /></div>
          <div>
            <label className="ap-label">Position</label>
            <select className="ap-input" value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}>
              {["home","property","blog","sidebar"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
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

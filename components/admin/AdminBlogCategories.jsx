"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import api from "@/lib/axios";


export default function AdminBlogCategories() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/blog-categories");

  const openAdd = () => { setEditing(null); setForm({ name: "", slug: "", description: "", isActive: true }); setModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, slug: r.slug, description: r.description || "", isActive: r.isActive }); setModal(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/blog-categories/${editing._id}`, form) : await api.post("/blog-categories", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/blog-categories");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/blog-categories/${id}`);
    toast.success("Deleted");
    mutate("/blog-categories");
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
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
        <h1 className="ap-title">Blog Categories</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add Category</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Category" : "Add Category"}>
        <div className="ap-form-stack">
          <div><label className="ap-label">Name *</label><input className="ap-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="ap-label">Description</label><textarea className="ap-input" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
          <div className="ap-form-footer">
            <button onClick={() => setModal(false)} className="ap-btn-cancel">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="ap-btn-save">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

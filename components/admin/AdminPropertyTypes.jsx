"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import api from "@/lib/axios";

const EMPTY = { name: "", slug: "", icon: "", isActive: true };

export default function AdminPropertyTypes() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/property-types");

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, slug: row.slug, icon: row.icon || "", isActive: row.isActive }); setModal(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/property-types/${editing._id}`, form) : await api.post("/property-types", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/property-types");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this property type?")) return;
    await api.delete(`/property-types/${id}`);
    toast.success("Deleted");
    mutate("/property-types");
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "icon", label: "Icon", render: (r) => r.icon ? <span style={{ fontSize: "1.125rem" }}>{r.icon}</span> : "—" },
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
        <h1 className="ap-title">Property Types</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add Type</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Type" : "Add Type"}>
        <div className="ap-form-stack">
          <div><label className="ap-label">Name *</label><input className="ap-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="ap-label">Slug</label><input className="ap-input" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" /></div>
          <div><label className="ap-label">Icon (emoji or text)</label><input className="ap-input" value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} /></div>
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

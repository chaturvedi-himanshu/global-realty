"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import api from "@/lib/axios";

const EMPTY = { name: "", icon: "", category: "other", isActive: true };

export default function AdminAmenities() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/amenities?all=true");

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, icon: row.icon || "", category: row.category, isActive: row.isActive }); setModal(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/amenities/${editing._id}`, form) : await api.post("/amenities", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/amenities?all=true");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete amenity?")) return;
    await api.delete(`/amenities/${id}`);
    toast.success("Deleted");
    mutate("/amenities?all=true");
  };

  const columns = [
    { key: "icon", label: "Icon", render: (r) => r.icon ? <span style={{ fontSize: "1.25rem" }}>{r.icon}</span> : "—" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category", render: (r) => <span style={{ textTransform: "capitalize" }}>{r.category}</span> },
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
        <h1 className="ap-title">Amenities</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add Amenity</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Amenity" : "Add Amenity"}>
        <div className="ap-form-stack">
          <div><label className="ap-label">Name *</label><input className="ap-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="ap-label">Icon (emoji)</label><input className="ap-input" value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="🏊" /></div>
          <div>
            <label className="ap-label">Category</label>
            <select className="ap-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              {["indoor","outdoor","security","utilities","recreation","other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
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

"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import api from "@/lib/axios";


export default function AdminPropertySubTypes() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", propertyType: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/property-subtypes");
  const { data: typesData } = useSWR("/property-types");

  const openAdd = () => { setEditing(null); setForm({ name: "", slug: "", propertyType: "", isActive: true }); setModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, slug: r.slug, propertyType: r.propertyType?._id || r.propertyType || "", isActive: r.isActive });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.propertyType) { toast.error("Name and type required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
      editing ? await api.put(`/property-subtypes/${editing._id}`, payload) : await api.post("/property-subtypes", payload);
      toast.success(editing ? "Updated" : "Created");
      mutate("/property-subtypes");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/property-subtypes/${id}`);
    toast.success("Deleted");
    mutate("/property-subtypes");
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "propertyType", label: "Type", render: (r) => r.propertyType?.name || "—" },
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
        <h1 className="ap-title">Property Sub Types</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add Sub Type</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Sub Type" : "Add Sub Type"}>
        <div className="ap-form-stack">
          <div><label className="ap-label">Name *</label><input className="ap-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div>
            <label className="ap-label">Property Type *</label>
            <select className="ap-input" value={form.propertyType} onChange={(e) => setForm((p) => ({ ...p, propertyType: e.target.value }))}>
              <option value="">Select Type</option>
              {typesData?.data?.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
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

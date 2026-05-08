"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import api from "@/lib/axios";

const EMPTY = { question: "", answer: "", category: "general", order: 0, isActive: true };

export default function AdminFAQs() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/cms/faqs?all=true");

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ question: r.question, answer: r.answer, category: r.category, order: r.order, isActive: r.isActive }); setModal(true); };

  const handleSave = async () => {
    if (!form.question || !form.answer) { toast.error("Question and answer required"); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/cms/faqs/${editing._id}`, form) : await api.post("/cms/faqs", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/cms/faqs?all=true");
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete FAQ?")) return;
    await api.delete(`/cms/faqs/${id}`);
    toast.success("Deleted");
    mutate("/cms/faqs?all=true");
  };

  const columns = [
    { key: "order", label: "#", render: (r) => r.order },
    { key: "question", label: "Question", render: (r) => <p style={{ overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, fontSize: "0.875rem" }}>{r.question}</p> },
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
        <h1 className="ap-title">FAQs</h1>
        <button onClick={openAdd} className="ap-btn-primary">+ Add FAQ</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit FAQ" : "Add FAQ"} size="lg">
        <div className="ap-form-stack">
          <div><label className="ap-label">Question *</label><input className="ap-input" value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} /></div>
          <div><label className="ap-label">Answer *</label><textarea className="ap-input" rows={5} value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label className="ap-label">Category</label><input className="ap-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} /></div>
            <div><label className="ap-label">Order</label><input type="number" className="ap-input" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} /></div>
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

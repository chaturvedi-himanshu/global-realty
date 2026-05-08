"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import api from "@/lib/axios";

const EMPTY = {
  title: "",
  department: "",
  location: "",
  salaryLabel: "",
  applyUrl: "",
  animation: "fadeInLeft",
  order: 0,
  isActive: true,
};

export default function AdminJobPostings() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/cms/job-postings?all=true");

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      title: r.title || "",
      department: r.department || "",
      location: r.location || "",
      salaryLabel: r.salaryLabel || "",
      applyUrl: r.applyUrl || "",
      animation: r.animation || "fadeInLeft",
      order: Number(r.order) || 0,
      isActive: Boolean(r.isActive),
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      editing
        ? await api.put(`/cms/job-postings/${editing._id}`, form)
        : await api.post("/cms/job-postings", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/cms/job-postings?all=true");
      setModal(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job?")) return;
    await api.delete(`/cms/job-postings/${id}`);
    toast.success("Deleted");
    mutate("/cms/job-postings?all=true");
  };

  const columns = [
    { key: "order", label: "#", render: (r) => r.order },
    {
      key: "title",
      label: "Title",
      render: (r) => (
        <p style={{ fontSize: "0.875rem" }}>{r.title}</p>
      ),
    },
    { key: "department", label: "Dept", render: (r) => r.department || "—" },
    { key: "location", label: "Location", render: (r) => r.location || "—" },
    {
      key: "isActive",
      label: "Active",
      render: (r) =>
        r.isActive ? (
          <span className="ap-check">✓</span>
        ) : (
          <span className="ap-cross">✗</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="ap-btn-row">
          <button onClick={() => openEdit(r)} className="ap-btn-edit">
            Edit
          </button>
          <button
            onClick={() => handleDelete(r._id)}
            className="ap-btn-delete"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Job postings</h1>
        <button onClick={openAdd} className="ap-btn-primary">
          + Add job
        </button>
      </div>
      <p className="text-1 text-color-3 mb-16">
        Shown on <code>/career</code>. Apply URL can be mailto: or https://
      </p>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit job" : "Add job"}
        size="lg"
      >
        <div className="ap-form-stack">
          <div>
            <label className="ap-label">Title *</label>
            <input
              className="ap-input"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="ap-label">Department</label>
              <input
                className="ap-input"
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="ap-label">Location</label>
              <input
                className="ap-input"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="ap-label">Salary label</label>
              <input
                className="ap-input"
                placeholder="$850"
                value={form.salaryLabel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, salaryLabel: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="ap-label">WOW animation class</label>
              <input
                className="ap-input"
                placeholder="fadeInLeft"
                value={form.animation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, animation: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="ap-label">Apply URL</label>
            <input
              className="ap-input"
              placeholder="https://... or mailto:careers@..."
              value={form.applyUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, applyUrl: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="ap-label">Order</label>
            <input
              type="number"
              className="ap-input"
              value={form.order}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  order: Number(e.target.value),
                }))
              }
            />
          </div>
          <label className="ap-checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            <span className="ap-checkbox-label">Active</span>
          </label>
          <div className="ap-form-footer">
            <button onClick={() => setModal(false)} className="ap-btn-cancel">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="ap-btn-save"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

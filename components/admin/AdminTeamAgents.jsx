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
  slug: "",
  role: "",
  photo: "",
  detailPhoto: "",
  agency: "",
  companyLink: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  bio: "",
  aboutTitle: "",
  socialFacebook: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialInstagram: "",
  order: 0,
  isActive: true,
};

export default function AdminTeamAgents() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("/cms/team-agents?all=true");

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      name: r.name || "",
      slug: r.slug || "",
      role: r.role || "",
      photo: r.photo || "",
      detailPhoto: r.detailPhoto || "",
      agency: r.agency || "",
      companyLink: r.companyLink || "",
      city: r.city || "",
      address: r.address || "",
      phone: r.phone || "",
      email: r.email || "",
      bio: r.bio || "",
      aboutTitle: r.aboutTitle || "",
      socialFacebook: r.socialFacebook || "",
      socialTwitter: r.socialTwitter || "",
      socialLinkedin: r.socialLinkedin || "",
      socialInstagram: r.socialInstagram || "",
      order: Number(r.order) || 0,
      isActive: Boolean(r.isActive),
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      editing
        ? await api.put(`/cms/team-agents/${editing._id}`, form)
        : await api.post("/cms/team-agents", form);
      toast.success(editing ? "Updated" : "Created");
      mutate("/cms/team-agents?all=true");
      setModal(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this agent?")) return;
    await api.delete(`/cms/team-agents/${id}`);
    toast.success("Deleted");
    mutate("/cms/team-agents?all=true");
  };

  const columns = [
    { key: "order", label: "#", render: (r) => r.order },
    {
      key: "photo",
      label: "Photo",
      render: (r) => {
        const src = r.photo || "";
        if (!src) return <span className="ap-thumb-placeholder">—</span>;
        return (
          <img
            src={src}
            alt=""
            className="ap-avatar"
            width={36}
            height={36}
            style={{ objectFit: "cover" }}
          />
        );
      },
    },
    {
      key: "name",
      label: "Name",
      render: (r) => (
        <div className="ap-agent-table-name">
          <div style={{ minWidth: 0 }}>
            <p
              className="ap-row-title"
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {r.name}
            </p>
            <p className="ap-row-meta">{r.city || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role", render: (r) => r.role || "—" },
    { key: "agency", label: "Agency", render: (r) => r.agency || "—" },
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
      <div className="ap-header ap-header--col" style={{ alignItems: "stretch" }}>
        <div>
          <h1 className="ap-title">Team agents</h1>
          <p className="ap-subtitle">
            Card and hero images upload to Firebase Storage (same bucket as the standalone admin). Public list: <code>/team</code>
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="ap-btn-primary"
          style={{ alignSelf: "flex-start" }}
        >
          + Add agent
        </button>
      </div>
      <div className="ap-cms-intro">
        <p className="ap-cms-intro__title">Agent profiles</p>
        <p className="ap-cms-intro__text">
          Detail page: <code>/team/[id or slug]</code>. Slug is generated from name if left empty.
        </p>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} />
      </div>
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit agent" : "Add agent"}
        size="lg"
      >
        <div
          className="ap-form-stack"
          style={{
            maxHeight: "min(70vh, 720px)",
            overflowY: "auto",
            paddingRight: "0.25rem",
          }}
        >
          <div className="ap-cms-modal-section">
            <div className="ap-cms-modal-section__label">Basics</div>
            <div>
              <label className="ap-label">Name *</label>
              <input
                className="ap-input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="ap-label">Slug (optional)</label>
              <input
                className="ap-input"
                placeholder="auto from name if empty"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              />
            </div>
            <div className="ap-grid-2col">
              <div>
                <label className="ap-label">Role</label>
                <input
                  className="ap-input"
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                />
              </div>
              <div>
                <label className="ap-label">Order</label>
                <input
                  type="number"
                  className="ap-input"
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, order: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="ap-cms-modal-section">
            <div className="ap-cms-modal-section__label">Photos</div>
            <div>
              <label className="ap-label">Card photo</label>
              <ImageUploader
                backend="firebase"
                folder="cms/team-agents"
                value={form.photo}
                onChange={(url) => setForm((p) => ({ ...p, photo: url }))}
                label="Upload card image"
              />
            </div>
            <div>
              <label className="ap-label">Detail hero</label>
              <ImageUploader
                backend="firebase"
                folder="cms/team-agents"
                value={form.detailPhoto}
                onChange={(url) => setForm((p) => ({ ...p, detailPhoto: url }))}
                label="Upload hero image"
              />
            </div>
          </div>

          <div className="ap-cms-modal-section">
            <div className="ap-cms-modal-section__label">Workplace</div>
            <div className="ap-grid-2col">
              <div>
                <label className="ap-label">Agency</label>
                <input
                  className="ap-input"
                  value={form.agency}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, agency: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="ap-label">City</label>
                <input
                  className="ap-input"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="ap-label">Company link</label>
              <input
                className="ap-input"
                value={form.companyLink}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyLink: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="ap-label">Address</label>
              <input
                className="ap-input"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
            <div className="ap-grid-2col">
              <div>
                <label className="ap-label">Phone</label>
                <input
                  className="ap-input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="ap-label">Email</label>
                <input
                  className="ap-input"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="ap-cms-modal-section">
            <div className="ap-cms-modal-section__label">About</div>
            <div>
              <label className="ap-label">About title</label>
              <input
                className="ap-input"
                placeholder="About {name}"
                value={form.aboutTitle}
                onChange={(e) =>
                  setForm((p) => ({ ...p, aboutTitle: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="ap-label">Bio</label>
              <textarea
                className="ap-input"
                rows={4}
                value={form.bio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="ap-cms-modal-section">
            <div className="ap-cms-modal-section__label">Social</div>
            <div className="ap-grid-2col">
              <div>
                <label className="ap-label">Facebook</label>
                <input
                  className="ap-input"
                  value={form.socialFacebook}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      socialFacebook: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="ap-label">X / Twitter</label>
                <input
                  className="ap-input"
                  value={form.socialTwitter}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      socialTwitter: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="ap-label">LinkedIn</label>
                <input
                  className="ap-input"
                  value={form.socialLinkedin}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      socialLinkedin: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="ap-label">Instagram</label>
                <input
                  className="ap-input"
                  value={form.socialInstagram}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      socialInstagram: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <label className="ap-checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            <span className="ap-checkbox-label">Show on site (active)</span>
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

"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function AdminInquiries() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useSWR(
    `/inquiries?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ""}`,
    fetcher
  );

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      toast.success("Status updated");
      mutate((key) => typeof key === "string" && key.includes("/inquiries"));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inquiry?")) return;
    await api.delete(`/inquiries/${id}`);
    toast.success("Deleted");
    mutate((key) => typeof key === "string" && key.includes("/inquiries"));
  };

  const typeLabel = (t) => {
    if (t === "site_visit") return "Site Visit";
    if (t === "book_meeting") return "Meeting";
    return "Agent Connect";
  };
  const formatVisitDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "—";
  const formatMeetingDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
  const formatScheduled = (r) => {
    if (r.inquiryType === "site_visit") return formatVisitDate(r.visitDate);
    if (r.inquiryType === "book_meeting") return formatMeetingDateTime(r.meetingDateTime);
    return "—";
  };

  const columns = [
    { key: "name", label: "Name", render: (r) => (
      <button onClick={() => setSelected(r)} className="ap-text-link">{r.name}</button>
    )},
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "inquiryType", label: "Type", render: (r) => typeLabel(r.inquiryType) },
    { key: "scheduled", label: "Scheduled", render: formatScheduled },
    { key: "interest", label: "Interest", render: (r) => r.interest || "—" },
    { key: "propertyTitle", label: "Property", render: (r) => r.propertyTitle || r.propertyId?.title || "General" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN") },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="ap-btn-row">
        {r.status === "new" && <button onClick={() => updateStatus(r._id, "read")} className="ap-btn-neutral">Mark Read</button>}
        {r.status !== "replied" && <button onClick={() => updateStatus(r._id, "replied")} className="ap-btn-success">Replied</button>}
        <button onClick={() => handleDelete(r._id)} className="ap-btn-delete">Delete</button>
      </div>
    )},
  ];

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Inquiries</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ap-input"
          style={{ width: "auto" }}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} searchable={false} />
      </div>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Inquiry Details">
        {selected && (
          <div className="ap-form-stack">
            <div className="ap-detail-grid">
              <div><span className="ap-detail-label">Name:</span> <span className="ap-detail-value">{selected.name}</span></div>
              <div><span className="ap-detail-label">Email:</span> <span className="ap-detail-value">{selected.email}</span></div>
              <div><span className="ap-detail-label">Phone:</span> <span className="ap-detail-value">{selected.phone || "—"}</span></div>
              <div><span className="ap-detail-label">Type:</span> <span className="ap-detail-value">{typeLabel(selected.inquiryType)}</span></div>
              {selected.inquiryType === "site_visit" && (
                <div><span className="ap-detail-label">Visit Date:</span> <span className="ap-detail-value">{formatVisitDate(selected.visitDate)}</span></div>
              )}
              {selected.inquiryType === "book_meeting" && (
                <div><span className="ap-detail-label">Meeting:</span> <span className="ap-detail-value">{formatMeetingDateTime(selected.meetingDateTime)}</span></div>
              )}
              <div><span className="ap-detail-label">Interest:</span> <span className="ap-detail-value">{selected.interest || "—"}</span></div>
              <div><span className="ap-detail-label">Date:</span> <span className="ap-detail-value">{new Date(selected.createdAt).toLocaleString("en-IN")}</span></div>
            </div>
            {selected.propertyTitle && (
              <div><span className="ap-detail-label">Property:</span> <span className="ap-detail-value">{selected.propertyTitle}</span></div>
            )}
            <div>
              <span className="ap-detail-label">Message:</span>
              <p className="ap-detail-message">{selected.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

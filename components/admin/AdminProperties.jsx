"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import Link from "next/link";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import api from "@/lib/axios";


export default function AdminProperties() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const params = new URLSearchParams({ page, limit: 15 });
  if (keyword) params.set("keyword", keyword);
  if (status) params.set("status", status);

  const { data, isLoading } = useSWR(`/properties?${params}&all=true`);

  const handleDelete = async (id) => {
    if (!confirm("Delete this property?")) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success("Property deleted");
      mutate((key) => typeof key === "string" && key.includes("/properties"));
    } catch {}
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      width: 70,
      render: (row) => {
        const img = row.images?.find((i) => i.isPrimary) || row.images?.[0];
        return img ? <img src={img.url} alt={row.title} className="ap-thumb" /> : <div className="ap-thumb-placeholder">No img</div>;
      },
    },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <div>
          <p className="ap-row-title">{row.title}</p>
          <p className="ap-row-meta">{row.city} · {row.listingType}</p>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => row.priceType === "on-request" ? "On Request" : `₹${Number(row.price).toLocaleString("en-IN")}`,
    },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "flags",
      label: "Flags",
      render: (row) => (
        <div className="ap-btn-row" style={{ flexWrap: "wrap" }}>
          {row.isFeatured && <span className="ap-flag ap-flag--yellow">Featured</span>}
          {row.isNew && <span className="ap-flag ap-flag--blue">New</span>}
          {row.isPremium && <span className="ap-flag ap-flag--purple">Premium</span>}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="ap-btn-row">
          <Link href={`/admin/properties/${row._id}`} className="ap-btn-edit">Edit</Link>
          <button onClick={() => handleDelete(row._id)} className="ap-btn-delete">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Properties</h1>
        <Link href="/admin/properties/add" className="ap-btn-primary">+ Add Property</Link>
      </div>
      <div className="admin-card" style={{ padding: "1.25rem" }}>
        <div className="ap-filter-bar">
          <input
            type="text"
            placeholder="Search properties..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="ap-input"
            style={{ flex: "1", minWidth: "12rem" }}
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="ap-input"
            style={{ flex: "none", width: "auto" }}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable
          columns={columns}
          data={data?.data}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          searchable={false}
        />
      </div>
    </div>
  );
}

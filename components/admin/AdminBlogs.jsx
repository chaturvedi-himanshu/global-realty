"use client";
import { useState } from "react";
import useSWR, { mutate } from "@/lib/swr-lite";
import Link from "next/link";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import api from "@/lib/axios";


export default function AdminBlogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(`/blogs?all=true&page=${page}&limit=15`);

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog deleted");
      mutate((key) => typeof key === "string" && key.includes("/blogs"));
    } catch {}
  };

  const columns = [
    {
      key: "featuredImage",
      label: "Image",
      width: 70,
      render: (r) =>
        r.featuredImage ? (
          <img src={r.featuredImage} alt={r.title} className="ap-thumb" />
        ) : (
          <div className="ap-thumb-placeholder">No img</div>
        ),
    },
    {
      key: "title",
      label: "Title",
      render: (r) => (
        <div>
          <p className="ap-row-title">{r.title}</p>
          <p className="ap-row-meta">{r.category?.name || "Uncategorized"}</p>
        </div>
      ),
    },
    { key: "author", label: "Author" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "publishedAt",
      label: "Published",
      render: (r) => r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("en-IN") : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="ap-btn-row">
          <Link href={`/admin/blogs/${r._id}`} className="ap-btn-edit">Edit</Link>
          <button onClick={() => handleDelete(r._id)} className="ap-btn-delete">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <h1 className="ap-title">Blogs</h1>
        <Link href="/admin/blogs/add" className="ap-btn-primary">+ Add Blog</Link>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <DataTable
          columns={columns}
          data={data?.data}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

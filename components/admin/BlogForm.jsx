"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import ImageUploader from "@/components/ui/ImageUploader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Modal from "@/components/ui/Modal";


const INITIAL = {
  title: "", slug: "", content: "", excerpt: "", featuredImage: "",
  category: "", author: "Admin", authorAvatar: "", tags: [],
  status: "draft", trending: false, metaTitle: "", metaDescription: "", readTime: 5,
};

export default function BlogForm({ blogId }) {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [catModal, setCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "" });
  const [savingCat, setSavingCat] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const { data: catData, mutate: mutateCats } = useSWR("/blog-categories");
  const { data: blogData } = useSWR(blogId ? `/blogs/${blogId}` : null);

  useEffect(() => {
    if (blogData?.data) {
      const b = blogData.data;
      setForm({ ...INITIAL, ...b, category: b.category?._id || b.category || "", tags: b.tags || [] });
    }
  }, [blogData]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) set("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const handleSave = async (status) => {
    if (!form.title) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, status: status || form.status };
      if (blogId) {
        await api.put(`/blogs/${blogId}`, payload);
        toast.success("Blog updated");
      } else {
        await api.post("/blogs", payload);
        toast.success("Blog created");
        router.push("/admin/blogs");
      }
    } catch {} finally { setSaving(false); }
  };

  const handleSaveCat = async () => {
    if (!catForm.name) { toast.error("Name required"); return; }
    setSavingCat(true);
    try {
      await api.post("/blog-categories", catForm);
      toast.success("Category created");
      mutateCats();
      setCatModal(false);
      setCatForm({ name: "", slug: "", description: "" });
    } catch {} finally { setSavingCat(false); }
  };

  return (
    <div className="ap-page-body">
      <div className="af-header">
        <h1 className="af-title">{blogId ? "Edit Blog" : "Add Blog"}</h1>
        <div className="af-header-actions">
          <button type="button" onClick={() => router.push("/admin/blogs")} className="af-btn-back">Cancel</button>
          <button onClick={() => handleSave("draft")} disabled={saving} className="ap-btn-cancel">Save Draft</button>
          <button onClick={() => handleSave("published")} disabled={saving} className="ap-btn-save" style={{ padding: "0.5rem 1.25rem" }}>
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="admin-card" style={{ padding: "1.25rem" }}>
              <label className="ap-label">Title *</label>
              <input className="ap-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Blog post title" />
            </div>

            <div className="admin-card" style={{ padding: "1.25rem" }}>
              <div className="af-tabs">
                {["content", "seo"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`af-tab${activeTab === tab ? " af-tab--active" : ""}`}
                  >
                    {tab === "content" ? "Content" : "SEO"}
                  </button>
                ))}
              </div>
              {activeTab === "content" && (
                <div className="af-panel">
                  <RichTextEditor value={form.content} onChange={(v) => set("content", v)} />
                </div>
              )}
              {activeTab === "seo" && (
                <div className="ap-form-stack af-panel">
                  <div><label className="ap-label">Meta Title</label><input className="ap-input" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></div>
                  <div><label className="ap-label">Meta Description</label><textarea className="ap-input" rows={3} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="admin-card" style={{ padding: "1.25rem" }}>
              <label className="ap-label">Featured Image</label>
              <ImageUploader value={form.featuredImage} onChange={(url) => set("featuredImage", url)} folder="proty/blogs" />
            </div>

            <div className="admin-card" style={{ padding: "1.25rem" }}>
              <div className="ap-form-stack">
                <div>
                  <label className="ap-label">Status</label>
                  <select className="ap-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <label className="ap-checkbox-row">
                  <input
                    type="checkbox"
                    checked={Boolean(form.trending)}
                    onChange={(e) => set("trending", e.target.checked)}
                  />
                  <span className="ap-checkbox-label">Trending blog</span>
                </label>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <label className="ap-label" style={{ marginBottom: 0 }}>Category</label>
                    <button type="button" onClick={() => setCatModal(true)} className="ap-text-link" style={{ fontSize: "0.75rem" }}>+ New</button>
                  </div>
                  <select className="ap-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">No category</option>
                    {catData?.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="ap-label">Author</label><input className="ap-input" value={form.author} onChange={(e) => set("author", e.target.value)} /></div>
                <div><label className="ap-label">Excerpt</label><textarea className="ap-input" rows={3} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Brief description..." /></div>
                <div><label className="ap-label">Read Time (min)</label><input type="number" className="ap-input" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} /></div>
                <div>
                  <label className="ap-label">Tags</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="ap-input"
                      style={{ flex: 1 }}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add tag + Enter"
                    />
                    <button type="button" onClick={addTag} className="ap-btn-neutral" style={{ whiteSpace: "nowrap" }}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                    {form.tags.map((tag) => (
                      <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.125rem 0.5rem", background: "rgba(220,53,69,0.1)", color: "var(--color-primary)", borderRadius: "9999px", fontSize: "0.75rem" }}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="New Blog Category">
        <div className="ap-form-stack">
          <div><label className="ap-label">Name *</label><input className="ap-input" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="ap-label">Description</label><textarea className="ap-input" rows={2} value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} /></div>
          <div className="ap-form-footer">
            <button onClick={() => setCatModal(false)} className="ap-btn-cancel">Cancel</button>
            <button onClick={handleSaveCat} disabled={savingCat} className="ap-btn-save">{savingCat ? "Saving..." : "Create"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

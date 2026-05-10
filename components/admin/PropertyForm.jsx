"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";
import ImageUploader from "@/components/ui/ImageUploader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import LocationSelectorModal from "./LocationSelectorModal";


const INITIAL_STATE = {
  title: "", slug: "", specification: "", description: "", price: "", priceType: "fixed",
  propertyType: "", propertySubType: "", status: "available", listingType: "sale",
  address: "", city: "", state: "", country: "India", pincode: "",
  latitude: "", longitude: "", mapEmbedUrl: "",
  bedrooms: "", bathrooms: "", balconies: "", floors: "", totalFloors: "",
  carpetArea: "", builtUpArea: "", superBuiltUpArea: "", areaUnit: "sqft",
  possessionStatus: "ready", possessionDate: "", propertyAge: "",
  amenities: [], features: [], images: [], videoUrl: "", virtualTourUrl: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  isFeatured: false, isNew: false, isPremium: false,
};

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "location", label: "Location" },
  { id: "details", label: "Details" },
  { id: "media", label: "Media" },
  { id: "amenities", label: "Amenities & Features" },
  { id: "seo", label: "SEO" },
];

export default function PropertyForm({ propertyId }) {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newFeature, setNewFeature] = useState({ label: "", value: "" });
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const { data: typesData } = useSWR("/property-types");
  const { data: subtypesData } = useSWR(form.propertyType ? `/property-subtypes?propertyType=${form.propertyType}` : "/property-subtypes");
  const { data: amenitiesData } = useSWR("/amenities");
  const { data: propertyData } = useSWR(propertyId ? `/properties/${propertyId}` : null);

  useEffect(() => {
    if (propertyData?.data) {
      const p = propertyData.data;
      setForm({
        ...INITIAL_STATE, ...p,
        propertyType: p.propertyType?._id || p.propertyType || "",
        propertySubType: p.propertySubType?._id || p.propertySubType || "",
        amenities: (p.amenities || []).map((a) => a._id || a),
        possessionDate: p.possessionDate ? new Date(p.possessionDate).toISOString().split("T")[0] : "",
      });
    }
  }, [propertyData]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    if (!String(form.specification || "").trim()) {
      toast.error("Specification is required (e.g. 2 BHK & 3 BHK apartments)");
      return;
    }
    setSaving(true);
    try {
      if (propertyId) {
        await api.put(`/properties/${propertyId}`, form);
        toast.success("Property updated");
      } else {
        await api.post("/properties", form);
        toast.success("Property created");
        router.push("/admin/properties");
      }
    } catch {} finally { setSaving(false); }
  };

  const addImage = () => setForm((prev) => ({
    ...prev,
    images: [...prev.images, { url: "", alt: "", isPrimary: prev.images.length === 0, order: prev.images.length }],
  }));

  const updateImage = (i, field, value) => setForm((prev) => {
    const imgs = [...prev.images];
    if (field === "isPrimary" && value) imgs.forEach((_, idx) => (imgs[idx] = { ...imgs[idx], isPrimary: idx === i }));
    else imgs[i] = { ...imgs[i], [field]: value };
    return { ...prev, images: imgs };
  });

  const removeImage = (i) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  const toggleAmenity = (id) => setForm((prev) => ({
    ...prev,
    amenities: prev.amenities.includes(id) ? prev.amenities.filter((a) => a !== id) : [...prev.amenities, id],
  }));
  const addFeature = () => {
    if (!newFeature.label || !newFeature.value) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, { ...newFeature }] }));
    setNewFeature({ label: "", value: "" });
  };
  const removeFeature = (i) => setForm((prev) => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));

  return (
    <form onSubmit={handleSubmit} className="ap-page-body">
      <div className="af-header">
        <h1 className="af-title">{propertyId ? "Edit Property" : "Add Property"}</h1>
        <div className="af-header-actions">
          <button type="button" onClick={() => router.push("/admin/properties")} className="af-btn-back">Cancel</button>
          <button type="submit" disabled={saving} className="ap-btn-save" style={{ padding: "0.5rem 1.25rem" }}>
            {saving ? "Saving..." : propertyId ? "Update" : "Create"}
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ overflow: "hidden" }}>
        <div className="af-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`af-tab${activeTab === tab.id ? " af-tab--active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="af-body">
          {activeTab === "basic" && (
            <div className="ap-grid-2col af-panel">
              <div className="ap-col-full">
                <label className="ap-label">Title *</label>
                <input className="ap-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Property title" required />
              </div>
              <div className="ap-col-full">
                <label className="ap-label">Specification *</label>
                <input
                  className="ap-input"
                  value={form.specification}
                  onChange={(e) => set("specification", e.target.value)}
                  placeholder="e.g. 2 BHK & 3 BHK apartments"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Shown on listing cards and property page; used for site search and chatbot matching.
                </p>
              </div>
              <div><label className="ap-label">Slug</label><input className="ap-input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated if empty" /></div>
              <div><label className="ap-label">Price</label><input type="number" className="ap-input" value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
              <div><label className="ap-label">Price Type</label>
                <select className="ap-input" value={form.priceType} onChange={(e) => set("priceType", e.target.value)}>
                  <option value="fixed">Fixed</option><option value="negotiable">Negotiable</option><option value="on-request">On Request</option>
                </select>
              </div>
              <div><label className="ap-label">Listing Type</label>
                <select className="ap-input" value={form.listingType} onChange={(e) => set("listingType", e.target.value)}>
                  <option value="sale">For Sale</option><option value="rent">For Rent</option><option value="both">Sale & Rent</option>
                </select>
              </div>
              <div><label className="ap-label">Status</label>
                <select className="ap-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option><option value="upcoming">Upcoming</option>
                </select>
              </div>
              <div><label className="ap-label">Property Type</label>
                <select className="ap-input" value={form.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
                  <option value="">Select Type</option>
                  {typesData?.data?.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div><label className="ap-label">Sub Type</label>
                <select className="ap-input" value={form.propertySubType} onChange={(e) => set("propertySubType", e.target.value)}>
                  <option value="">Select Sub Type</option>
                  {subtypesData?.data?.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="ap-col-full"><label className="ap-label">Description</label><RichTextEditor value={form.description} onChange={(v) => set("description", v)} /></div>
              <div className="ap-col-full">
                <label className="ap-label">Flags</label>
                <div className="ap-checkbox-multi">
                  {[{ key: "isFeatured", label: "Featured" }, { key: "isNew", label: "New" }, { key: "isPremium", label: "Premium" }].map(({ key, label }) => (
                    <label key={key} className="ap-checkbox-row"><input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} /><span className="ap-checkbox-label">{label}</span></label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "location" && (
            <div className="ap-grid-2col af-panel">
              <div className="ap-col-full">
                <label className="ap-label">Country / State / City</label>
                <button type="button" onClick={() => setLocationModalOpen(true)} className="ap-input af-select-trigger">
                  <span style={{ color: form.city || form.state ? "#111827" : "#9ca3af" }}>
                    {form.city || form.state || form.country ? [form.city, form.state, form.country].filter(Boolean).join(", ") : "Click to select location"}
                  </span>
                  <svg style={{ width: "1rem", height: "1rem", color: "#9ca3af", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div><label className="ap-label">City</label><input className="ap-input" value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div><label className="ap-label">State</label><input className="ap-input" value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
              <div><label className="ap-label">Country</label><input className="ap-input" value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
              <div><label className="ap-label">Pincode</label><input className="ap-input" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></div>
              <div className="ap-col-full"><label className="ap-label">Full Address</label><input className="ap-input" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
              <div><label className="ap-label">Latitude</label><input type="number" step="any" className="ap-input" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} /></div>
              <div><label className="ap-label">Longitude</label><input type="number" step="any" className="ap-input" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} /></div>
              <div className="ap-col-full"><label className="ap-label">Map Embed URL</label><input className="ap-input" value={form.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} /></div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="af-grid-3 af-panel">
              {[
                { key: "bedrooms", label: "Bedrooms" }, { key: "bathrooms", label: "Bathrooms" },
                { key: "balconies", label: "Balconies" }, { key: "floors", label: "Floor No." },
                { key: "totalFloors", label: "Total Floors" }, { key: "carpetArea", label: "Carpet Area" },
                { key: "builtUpArea", label: "Built-up Area" }, { key: "superBuiltUpArea", label: "Super Built-up" },
                { key: "propertyAge", label: "Property Age (yrs)" },
              ].map(({ key, label }) => (
                <div key={key}><label className="ap-label">{label}</label><input type="number" className="ap-input" value={form[key]} onChange={(e) => set(key, e.target.value)} /></div>
              ))}
              <div><label className="ap-label">Area Unit</label>
                <select className="ap-input" value={form.areaUnit} onChange={(e) => set("areaUnit", e.target.value)}>
                  <option value="sqft">sq.ft</option><option value="sqm">sq.m</option><option value="yards">yards</option>
                </select>
              </div>
              <div><label className="ap-label">Possession Status</label>
                <select className="ap-input" value={form.possessionStatus} onChange={(e) => set("possessionStatus", e.target.value)}>
                  <option value="ready">Ready to Move</option><option value="under-construction">Under Construction</option>
                </select>
              </div>
              <div><label className="ap-label">Possession Date</label><input type="date" className="ap-input" value={form.possessionDate} onChange={(e) => set("possessionDate", e.target.value)} /></div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="ap-form-stack af-panel">
              <div>
                <div className="af-media-head">
                  <label className="ap-label af-section-label">Images</label>
                  <button type="button" onClick={addImage} className="ap-btn-save" style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem" }}>+ Add Image</button>
                </div>
                <div className="af-images-editor">
                  {form.images.map((img, i) => (
                    <div key={i} className="af-image-card">
                      <ImageUploader value={img.url} onChange={(url) => updateImage(i, "url", url)} folder="proty/properties" />
                      <input className="ap-input" placeholder="Alt text" value={img.alt} onChange={(e) => updateImage(i, "alt", e.target.value)} />
                      <div className="af-image-footer">
                        <label className="ap-checkbox-row" style={{ fontSize: "0.75rem" }}>
                          <input type="checkbox" checked={img.isPrimary} onChange={(e) => updateImage(i, "isPrimary", e.target.checked)} />
                          <span>Primary</span>
                        </label>
                        <button type="button" onClick={() => removeImage(i)} className="af-link-danger">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="ap-label">Video URL (YouTube/Vimeo)</label><input className="ap-input" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} /></div>
              <div><label className="ap-label">Virtual Tour URL</label><input className="ap-input" value={form.virtualTourUrl} onChange={(e) => set("virtualTourUrl", e.target.value)} /></div>
            </div>
          )}

          {activeTab === "amenities" && (
            <div className="ap-form-stack af-panel">
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Amenities</h3>
                {amenitiesData?.data && (
                  <div className="af-amenities-grid">
                    {amenitiesData.data.map((amenity) => (
                      <label key={amenity._id} className="af-amenity" style={{
                        padding: "0.5rem",
                        border: `1px solid ${form.amenities.includes(amenity._id) ? "var(--color-primary)" : "#e5e7eb"}`,
                        borderRadius: "0.5rem",
                        background: form.amenities.includes(amenity._id) ? "rgba(220,53,69,0.05)" : "transparent",
                      }}>
                        <input type="checkbox" checked={form.amenities.includes(amenity._id)} onChange={() => toggleAmenity(amenity._id)} />
                        <span>{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Custom Features</h3>
                <div className="af-feature-add">
                  <input className="ap-input" style={{ flex: 1 }} placeholder="Label (e.g. Carpet Area)" value={newFeature.label} onChange={(e) => setNewFeature((p) => ({ ...p, label: e.target.value }))} />
                  <input className="ap-input" style={{ flex: 1 }} placeholder="Value (e.g. 1200 sqft)" value={newFeature.value} onChange={(e) => setNewFeature((p) => ({ ...p, value: e.target.value }))} />
                  <button type="button" onClick={addFeature} className="ap-btn-save" style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>Add</button>
                </div>
                <div className="ap-stats-list">
                  {form.features.map((f, i) => (
                    <div key={i} className="ap-stat-row">
                      <span className="ap-stat-row__label">{f.label}</span>
                      <span className="ap-stat-row__value">{f.value}</span>
                      <button type="button" onClick={() => removeFeature(i)} className="ap-stat-row__remove">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="ap-form-stack af-panel">
              <div><label className="ap-label">Meta Title</label><input className="ap-input" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></div>
              <div><label className="ap-label">Meta Description</label><textarea className="ap-input" rows={3} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></div>
              <div><label className="ap-label">Meta Keywords</label><input className="ap-input" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} placeholder="comma separated keywords" /></div>
            </div>
          )}
        </div>
      </div>

      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        initialValues={{ country: form.country, state: form.state, city: form.city }}
        onConfirm={(loc) => { set("country", loc.country); set("state", loc.state); set("city", loc.city); }}
      />
    </form>
  );
}

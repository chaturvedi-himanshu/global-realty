"use client";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";
import PropertyGridItems from "@/components/properties/PropertyGridItems";

const fetcher = (url) => api.get(url).then((r) => r.data);
const getLabel = (v) => (v && typeof v === "object" ? v.name || "" : v || "");
const getRefId = (v) => (v && typeof v === "object" ? v._id || "" : v || "");
/** Prefer slug in listing URLs; fall back to id for legacy objects without slug. */
const getSubTypeQueryValue = (v) => {
  if (!v) return "";
  if (typeof v === "object") {
    const slug = String(v.slug || "").trim();
    if (slug) return slug;
    return v._id ? String(v._id) : "";
  }
  return String(v);
};
export default function RelatedProperties({ city, propertySubType, currentId }) {
  const params = new URLSearchParams({ limit: 8 });
  const cityParam = getRefId(city);
  const subTypeParam = getSubTypeQueryValue(propertySubType);
  if (cityParam) params.set("city", cityParam);
  if (subTypeParam) params.set("propertySubType", subTypeParam);

  const { data, isLoading } = useSWR(`/properties?${params}`, fetcher);

  const properties = (data?.data || []).filter(
    (p) => p._id !== currentId
  ).slice(0, 3);

  if (!isLoading && !properties.length) return null;

  return (
    <section className="section-similar-properties tf-spacing-3">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section mb-32">
              <h2 className="title">Similar Properties</h2>
            </div>
            {isLoading ? (
              <div className="row">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="col-xl-4 col-md-6">
                    <div className="det-related-skeleton" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="tf-grid-layout lg-col-3 md-col-2">
                <PropertyGridItems properties={properties} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

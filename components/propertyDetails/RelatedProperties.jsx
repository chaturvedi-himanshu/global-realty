"use client";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";
import PropertyGridItems from "@/components/properties/PropertyGridItems";
import {
  buildSimilarPropertiesSearchParams,
  filterSimilarPropertyList,
} from "@/lib/similarPropertiesQuery";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function RelatedProperties({
  city,
  propertyType,
  currentProperty,
}) {
  const params = buildSimilarPropertiesSearchParams({
    city,
    propertyType,
    limit: 24,
  });

  const { data, isLoading } = useSWR(`/properties?${params}`, fetcher);

  const properties = !isLoading
    ? filterSimilarPropertyList(data?.data, currentProperty, 3)
    : [];

  // When there are no similar properties, keep comfortable space above footer.
  if (!isLoading && !properties.length)
    return <div className="tf-spacing-6" aria-hidden="true" />;

  return (
    <section className="section-similar-properties tf-spacing-3">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section mb-32">
              <h2 className="title">Similar Projects</h2>
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

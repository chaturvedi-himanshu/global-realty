"use client";

import PropertyDetailRichText from "@/components/propertyDetails/PropertyDetailRichText";

export default function OverviewSection({ content = "" }) {
  const html = String(content || "").trim();
  if (!html) return null;

  return (
    <>
      <div className="wg-title text-11 fw-6 text-color-heading">Overview</div>
      <div className="content">
        <PropertyDetailRichText
          html={html}
          className="description text-1"
          style={{ maxHeight: "none", overflow: "visible" }}
        />
      </div>
    </>
  );
}

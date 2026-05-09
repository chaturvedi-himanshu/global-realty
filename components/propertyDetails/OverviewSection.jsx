"use client";

import React from "react";

export default function OverviewSection({ content = "" }) {
  const html = String(content || "").trim();
  if (!html) return null;

  return (
    <>
      <div className="wg-title text-11 fw-6 text-color-heading">Overview</div>
      <div className="content">
        <div
          className="description text-1"
          style={{ maxHeight: "none", overflow: "visible" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );
}

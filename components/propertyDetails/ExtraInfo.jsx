"use client";

export default function ExtraInfo({ property }) {
  if (!property) return null;

  const desc = property.description || "";

  return (
    <>
      <div className="wg-title text-11 fw-6 text-color-heading">
        Property Details
      </div>

      {desc && (
        <div className="content">
          <div
            className="description text-1"
            style={{ maxHeight: "none", overflow: "visible" }}
            dangerouslySetInnerHTML={{ __html: desc }}
          />
        </div>
      )}

    </>
  );
}

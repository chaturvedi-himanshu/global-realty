"use client";

const getLabel = (v) => {
  if (!v) return "";
  if (typeof v === "object") return v.name || "";
  if (typeof v === "string" && /^[a-f\d]{24}$/i.test(v)) return "";
  return v;
};

const fmtPrice = (price, currency = "INR") => {
  const sym = { INR: "₹", USD: "$", AED: "د.إ" }[currency] || "₹";
  return `${sym}${Number(price || 0).toLocaleString("en-IN")}`;
};

export default function ExtraInfo({ property }) {
  if (!property) return null;

  const desc = property.description || "";
  const subType = property.propertySubType?.name || getLabel(property.propertySubType) || "-";
  const isPresent = (value) =>
    value !== "" && value !== null && value !== undefined && Number(value) !== 0;
  const detailsLeft = [
    { label: "Sub Type", value: subType },
    { label: "Price", value: fmtPrice(property.price, property.currency) },
    { label: "Rooms", value: property.rooms || property.bedrooms || "" },
    { label: "Baths", value: property.bathrooms || "" },
  ].filter((item) => isPresent(item.value));

  const detailsRight = [
    { label: "Beds", value: property.bedrooms || "" },
    { label: "Year built", value: property.yearBuilt || "" },
    {
      label: "Type",
      value: property.propertyType?.name || getLabel(property.propertyType) || "",
    },
    { label: "Status", value: property.status || "" },
    { label: "Garage", value: property.garages ?? "" },
  ].filter((item) => isPresent(item.value));

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

      {(detailsLeft.length > 0 || detailsRight.length > 0) && (
        <div className="box">
          {detailsLeft.length > 0 && (
            <ul>
              {detailsLeft.map((item) => (
                <li className="flex" key={item.label}>
                  <p className="fw-6">{item.label}</p>
                  <p>{item.value}</p>
                </li>
              ))}
            </ul>
          )}
          {detailsRight.length > 0 && (
            <ul>
              {detailsRight.map((item) => (
                <li className="flex" key={item.label}>
                  <p className="fw-6">{item.label}</p>
                  <p style={item.label === "Status" ? { textTransform: "capitalize" } : undefined}>
                    {item.value}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

"use client";

import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";
import * as IoIcons from "react-icons/io5";
import * as BsIcons from "react-icons/bs";

const getLabel = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value.name || "";
  if (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)) return "";
  return value;
};

const formatArea = (value, unit = "sqft") => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${n.toLocaleString("en-IN")} ${unit}`;
};

const formatCount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(n);
};

const getReactIconComponent = (iconName) => {
  const key = String(iconName || "").trim();
  if (!key) return null;
  const packs = [FiIcons, FaIcons, MdIcons, IoIcons, BsIcons];
  for (const pack of packs) {
    if (pack[key]) return pack[key];
  }
  return null;
};

function buildDetailRows(property) {
  if (!property) return [];

  const floorNumber =
    Number.isFinite(Number(property.floorNumber)) &&
    Number(property.floorNumber) > 0
      ? Number(property.floorNumber)
      : null;
  const totalFloors =
    Number.isFinite(Number(property.totalFloors)) &&
    Number(property.totalFloors) > 0
      ? Number(property.totalFloors)
      : null;
  const floorLabel =
    floorNumber != null && totalFloors != null
      ? `${floorNumber} / ${totalFloors}`
      : floorNumber != null
        ? String(floorNumber)
        : totalFloors != null
          ? String(totalFloors)
          : "";
  const baths = formatCount(property.bathrooms);
  const propType =
    property.propertyType?.name || getLabel(property.propertyType) || "";
  const areaUnit = property.areaUnit || "sqft";
  const area = formatArea(property.landSize, areaUnit);
  const garages = formatCount(property.garages);
  const yearBuilt = property.yearBuilt ? String(property.yearBuilt) : "";
  const beds = formatCount(property.bedrooms);
  const size = formatArea(
    property.totalSize ||
      property.builtUpArea ||
      property.superBuiltUpArea ||
      property.carpetArea,
    areaUnit,
  );
  const listingTypeLabel = property.listingType
    ? property.listingType.charAt(0).toUpperCase() +
      property.listingType.slice(1)
    : "";
  const typeLabel = [propType, listingTypeLabel].filter(Boolean).join(" / ");

  const fallbackItems = [
    floorLabel
      ? { icon: "icon-HouseLine", label: "Floors:", value: floorLabel }
      : null,
    baths ? { icon: "icon-Bathtub", label: "Bathrooms:", value: baths } : null,
    typeLabel
      ? { icon: "icon-SlidersHorizontal", label: "Type:", value: typeLabel }
      : null,
    area ? { icon: "icon-Crop", label: "Land Size:", value: area } : null,
    garages
      ? { icon: "icon-Garage-1", label: "Garages", value: garages }
      : null,
    yearBuilt
      ? { icon: "icon-Hammer", label: "Year Built:", value: yearBuilt }
      : null,
    beds ? { icon: "icon-Bed-2", label: "Bedrooms:", value: beds } : null,
    size ? { icon: "icon-Ruler", label: "Size:", value: size } : null,
  ].filter(Boolean);

  const overviewData = Array.isArray(property.overviewData)
    ? property.overviewData
        .map((item) => ({
          label: String(item?.key || "").trim(),
          value: String(item?.value || "").trim(),
          icon: String(item?.icon || "").trim(),
        }))
        .filter((item) => item.label && item.value)
    : [];

  const detailItems =
    overviewData.length > 0
      ? overviewData.map((item) => ({
          iconComponent: getReactIconComponent(item.icon),
          label: `${item.label}:`,
          value: item.value,
        }))
      : fallbackItems;

  const detailRows = [];
  for (let i = 0; i < detailItems.length; i += 2) {
    detailRows.push(detailItems.slice(i, i + 2));
  }
  return detailRows;
}

export default function ExtraInfo({ property }) {
  if (!property) return null;

  const desc = property.description || "";
  const detailRows = buildDetailRows(property);

  if (!desc && detailRows.length === 0) return null;

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

      {detailRows.length > 0 && (
        <div className="info-detail">
          {detailRows.map((row, rowIdx) => (
            <div className="wrap-box" key={`row-${rowIdx}`}>
              {row.map((item, idx) => (
                <div className="box-icon" key={`${item.label}-${idx}`}>
                  <div className="icons">
                    {item.iconComponent ? (
                      <item.iconComponent size={20} />
                    ) : (
                      <i className={item.icon} />
                    )}
                  </div>
                  <div className="content">
                    <div className="text-4 text-color-default">
                      {item.label}
                    </div>
                    <div className="text-1 text-color-heading">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

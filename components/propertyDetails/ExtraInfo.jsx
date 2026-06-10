"use client";

import PropertyDetailRichText from "@/components/propertyDetails/PropertyDetailRichText";
import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as BsIcons from "react-icons/bs";
import * as CgIcons from "react-icons/cg";
import * as CiIcons from "react-icons/ci";
import * as DiIcons from "react-icons/di";
import * as FaLegacyIcons from "react-icons/fa";
import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa6";
import * as FcIcons from "react-icons/fc";
import * as GiIcons from "react-icons/gi";
import * as GoIcons from "react-icons/go";
import * as GrIcons from "react-icons/gr";
import * as HiIcons from "react-icons/hi";
import * as Hi2Icons from "react-icons/hi2";
import * as ImIcons from "react-icons/im";
import * as IoLegacyIcons from "react-icons/io";
import * as MdIcons from "react-icons/md";
import * as IoIcons from "react-icons/io5";
import * as LiaIcons from "react-icons/lia";
import * as LuIcons from "react-icons/lu";
import * as PiIcons from "react-icons/pi";
import * as RiIcons from "react-icons/ri";
import * as RxIcons from "react-icons/rx";
import * as SiIcons from "react-icons/si";
import * as SlIcons from "react-icons/sl";
import * as TbIcons from "react-icons/tb";
import * as TfiIcons from "react-icons/tfi";
import * as VscIcons from "react-icons/vsc";
import * as WiIcons from "react-icons/wi";

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

  // Support multiple react-icons packs used historically in CMS content.
  const packs = [
    AiIcons,
    BiIcons,
    BsIcons,
    CgIcons,
    CiIcons,
    DiIcons,
    FiIcons,
    FaIcons, // react-icons/fa6
    FaLegacyIcons, // react-icons/fa
    FcIcons,
    GiIcons,
    GoIcons,
    GrIcons,
    HiIcons, // react-icons/hi
    Hi2Icons, // react-icons/hi2
    ImIcons,
    MdIcons,
    IoIcons, // react-icons/io5
    IoLegacyIcons, // react-icons/io
    LiaIcons,
    LuIcons,
    PiIcons,
    RiIcons,
    RxIcons,
    SiIcons,
    SlIcons,
    TbIcons,
    TfiIcons,
    VscIcons,
    WiIcons,
  ];

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
        Project Details
      </div>

      {desc && (
        <div className="content">
          <PropertyDetailRichText
            html={desc}
            className="description text-1"
            style={{ maxHeight: "none", overflow: "visible" }}
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

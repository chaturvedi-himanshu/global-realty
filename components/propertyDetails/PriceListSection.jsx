"use client";
import React from "react";

export default function PriceListSection({ priceList = [] }) {
  const rows = Array.isArray(priceList)
    ? priceList
        .map((item) => ({
          property: String(item?.property || "").trim(),
          inventory: String(item?.inventory || "").trim(),
          size: String(item?.size || "").trim(),
          price: String(item?.price || "").trim(),
        }))
        .filter(
          (item) => item.property || item.inventory || item.size || item.price,
        )
    : [];

  if (!rows.length) return null;

  return (
    <>
      <div className="wg-title text-11 fw-6 text-color-heading">Price List</div>
      <div className="price-list-table-wrap">
        <table className="price-list-table" aria-label="Property price list">
          <thead>
            <tr>
              <th>Property</th>
              <th>Inventory</th>
              <th>Size</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.property}-${row.inventory}-${idx}`}>
                <td>{row.property || "-"}</td>
                <td>{row.inventory || "-"}</td>
                <td>{row.size || "-"}</td>
                <td>{row.price || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

import React from "react";

export default function MovementsFilterBar({
  searchWaybill,
  setSearchWaybill,
  placeholder,
}) {
  return (
    <div className="filter-bar">
      <input
        id="search"
        type="text"
        className="input"
        placeholder={placeholder || "Search by Waybill or VIN"}
        value={searchWaybill}
        onChange={(e) => setSearchWaybill(e.target.value)}
      />

    </div>
  );
}

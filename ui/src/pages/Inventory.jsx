import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnitTable from "../components/UnitTable";
import UnitFilters from "../components/UnitFilters";
import GenericTable from "../components/GenericTable";

const unitColumns = [
  { 
    label: "Engine No.", 
    key: "engine",
    render: (val) => <strong>{val}</strong> 
  },
  { label: "Frame", key: "frame" },
  { label: "Model", key: "model" },
  { label: "Color", key: "color" },
  { label: "DA", key: "da" },
  { label: "Last Known Warehouse", key: "current_warehouse" },
  { 
    label: "Status", 
    key: "status",
    render: (status) => (
      <span className={`badge badge-${status.toLowerCase().replace(' ', '_')}`}>
        {status}
      </span>
    )
  }
];

export const MOCK_UNITS = [
  {
    engine: "ENG-882910",
    frame: "FRM-XP122",
    model: "Hilux G",
    color: "Super White",
    da: "DA-2026-005",
    current_warehouse: "Laguna Plant",
    status: "IN STORAGE"
  },
  {
    engine: "ENG-882911",
    frame: "FRM-XP123",
    model: "Hilux G",
    color: "Attitude Black",
    da: "DA-2026-005",
    current_warehouse: "In Transit",
    status: "IN TRANSIT"
  },
  {
    engine: "ENG-994012",
    frame: "FRM-ZV990",
    model: "Fortuner V",
    color: "Silver Metallic",
    da: "DA-2026-009",
    current_warehouse: "Davao Port",
    status: "IN STORAGE"
  },
  {
    engine: "ENG-773104",
    frame: "FRM-LK551",
    model: "Vios E",
    color: "Red Mica",
    da: "DA-2026-012",
    current_warehouse: "Manila Hub",
    status: "CLOSED"
  }
];

export default function Inventory() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1 className="page-title">Units</h1>
      
      <UnitFilters
        // warehouse={warehouse}
        // setWarehouse={setWarehouse}
        // status={status}
        // setStatus={setStatus}
        // search={search}
        // setSearch={setSearch}
        // placeholder="Search VIN, Engine, or Frame..."
      />
      <GenericTable 
        columns={unitColumns} 
        data={MOCK_UNITS} 
        onRowClick={(unit) => navigate("/units/")}
      />
    </div>
  );
}
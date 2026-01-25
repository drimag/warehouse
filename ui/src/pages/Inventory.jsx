import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import UnitTable from "../components/UnitTable";
import UnitFilters from "../components/UnitFilters";

/* ---------- Mock Data ---------- */
const mockUnits = [
  { vin: "VIN123", status: "STORED", currentWarehouse: "Warehouse A" },
  { vin: "VIN456", status: "IN_TRANSIT", currentWarehouse: null },
  { vin: "VIN789", status: "PENDING", currentWarehouse: "Warehouse B" },
  { vin: "VIN999", status: "STORED", currentWarehouse: "Warehouse B" },
];

export default function Inventory() {
  const navigate = useNavigate();

  const [units] = useState(mockUnits);
  const [warehouse, setWarehouse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const warehouses = ["ALL", "Warehouse A", "Warehouse B"];
  const statuses = ["ALL", "STORED", "IN_TRANSIT", "PENDING"];

  const filteredUnits = units.filter((u) => {
    if (warehouse !== "ALL" && u.currentWarehouse !== warehouse) return false;
    if (status !== "ALL" && u.status !== status) return false;
    if (!u.vin.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page">
      <h1 className="page-title">Inventory</h1>
      <UnitFilters
        warehouse={warehouse}
        setWarehouse={setWarehouse}
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
      />

      <UnitTable
        units={filteredUnits}
        onRowClick={(vin) => navigate(`/units/${vin}`)}
      />
    </div>
  );
}

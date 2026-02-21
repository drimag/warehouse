import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnitTable from "../components/UnitTable";
import UnitFilters from "../components/UnitFilters";

const mockUnits = [
  { 
    vin: "VIN123", 
    engine: "JA69ED080312", 
    frame: "K2VS1008225", 
    model: "ACB125CBFTIV", 
    color: "OB", 
    status: "STORED", 
    currentWarehouse: "Warehouse A" 
  },
  { 
    vin: "VIN456", 
    engine: "JA69ED080323", 
    frame: "K2VS1008125", 
    model: "ACB125CBFTIV", 
    color: "CR", 
    status: "IN_TRANSIT", 
    currentWarehouse: null 
  },
];

export default function Inventory() {
  const navigate = useNavigate();

  const [units] = useState(mockUnits);
  const [warehouse, setWarehouse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredUnits = units.filter((u) => {
    if (warehouse !== "ALL" && u.currentWarehouse !== warehouse) return false;
    if (status !== "ALL" && u.status !== status) return false;
    const searchStr = search.toLowerCase();
    return (
      u.vin.toLowerCase().includes(searchStr) ||
      u.engine.toLowerCase().includes(searchStr) ||
      u.frame.toLowerCase().includes(searchStr)
    );
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
        placeholder="Search VIN, Engine, or Frame..."
      />

      <UnitTable
        units={filteredUnits}
        onRowClick={(vin) => navigate(`/units/`)}
      />
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MovementTable from "../components/MovementTable";
import MovementsFilterBar from "../components/MovementsFilterBar.jsx";
import "../styles/layout.css";

const mockMovements = [
  {
    id: 1,
    vin: "VIN123",
    fromWarehouse: "Warehouse A",
    toWarehouse: "Warehouse B",
    action: "STORED",
    timestamp: "2026-01-22 10:21",
  },
  {
    id: 2,
    vin: "VIN123",
    fromWarehouse: "Warehouse B",
    toWarehouse: "Warehouse B",
    action: "IN_TRANSIT",
    timestamp: "2026-01-22 14:05",
  },
  {
    id: 3,
    vin: "VIN456",
    fromWarehouse: "Warehouse B",
    toWarehouse: "Warehouse A",
    action: "STORED",
    timestamp: "2026-01-23 09:12",
  },
];

export default function Movement() {
  const navigate = useNavigate();

  const [movements] = useState(mockMovements);
  const [searchVin, setSearchVin] = useState("");
  const [from, setFrom] = useState("ALL");
  const [to, setTo] = useState("ALL");
  const [action, setAction] = useState("ALL");

  const filtered = movements.filter((m) => {
    if (!m.vin.toLowerCase().includes(searchVin.toLowerCase())) return false;
    if (from !== "ALL" && m.fromWarehouse !== from) return false;
    if (to !== "ALL" && m.toWarehouse !== to) return false;
    if (action !== "ALL" && m.action !== action) return false;
    return true;
  });

  return (
    <div className="page">
      <h1 className="page-title">Movements</h1>

      <MovementsFilterBar
        searchVin={searchVin}
        setSearchVin={setSearchVin}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        action={action}
        setAction={setAction}
      />

      <MovementTable 
        movements={filtered} 
        onRowClick={(vin) => navigate(`/units/`)}
      />
    </div>
  );
}
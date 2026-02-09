import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MovementTable from "../components/MovementTable.jsx";
import MovementsFilterBar from "../components/MovementFilterBar.jsx";
import "../styles/layout.css";

// Mock data now represents the "Join Table" (Waybill_Items)
// Each row is a unique combination of a VIN and a Waybill
const mockMovements = [
  {
    movementId: "MOV-1001",
    timeScanned: "2026-01-22 10:21:05",
    waybill: "WB-8821",
    vin: "1HGCM82635A001",
  },
  {
    movementId: "MOV-1002",
    timeScanned: "2026-01-22 10:22:14",
    waybill: "WB-8821",
    vin: "1HGCM82635A002",
  },
  {
    movementId: "MOV-1003",
    timeScanned: "2026-01-22 14:05:33",
    waybill: "WB-9940",
    vin: "JTDZN3EU4F1009",
  }
];

export default function Movement() {
  const navigate = useNavigate();
  const [movements] = useState(mockMovements);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic allows searching by Waybill OR VIN
  const filtered = movements.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.waybill.toLowerCase().includes(query) || 
      m.vin.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page">
      <h1 className="page-title">Unit Movement History</h1>

      <MovementsFilterBar
        searchWaybill={searchQuery}
        setSearchWaybill={setSearchQuery}
        placeholder="Search by Waybill or VIN..."
      />

      <MovementTable 
        movements={filtered} 
        // We navigate to the specific unit detail page when a row is clicked
        onRowClick={(vin) => navigate(`/units/${vin}`)}
      />
    </div>
  );
}
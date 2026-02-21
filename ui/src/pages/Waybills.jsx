import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WaybillTable from "../components/WaybillTable.jsx";
import WaybillFilterBar from "../components/WaybillFilterBar.jsx";
import "../styles/layout.css";

const mockMovements = [
  {
    waybill: "WaybillA",
    driver: "John Doe",
    truck: "TRK-001",
    timestamp: "2026-01-22 10:21",
    status: "Processed",
    inout: "IN",
    quantity: 50,
    photoUrl: "https://example.com/p1.jpg",
    userEmail: "admin@warehouse.com",
  },
  {
    waybill: "WaybillB",
    driver: "Jane Smith",
    truck: "TRK-005",
    timestamp: "2026-01-22 14:05",
    status: "Active",
    inout: "OUT",
    quantity: 12,
    photoUrl: "https://example.com/p2.jpg",
    userEmail: "worker1@warehouse.com",
  }
];

export default function Waybills() {
  const navigate = useNavigate();
  const [movements] = useState(mockMovements);
  const [searchWaybill, setSearchWaybill] = useState("");

  const filtered = movements.filter((m) => {
    return m.waybill.toLowerCase().includes(searchWaybill.toLowerCase());
  });

  return (
    <div className="page">
      <h1 className="page-title">Waybills</h1>

      <WaybillFilterBar
        searchWaybill={searchWaybill}
        setSearchWaybill={setSearchWaybill}
        // If you want to filter by Driver or Status, pass those props here too
      />

      <WaybillTable 
        movements={filtered} 
        // onRowClick={(vin) => navigate(`/units/${vin}`)}
      />
    </div>
  );
}
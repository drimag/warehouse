import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GenericTable from "../components/GenericTable.jsx";
import WaybillFilterBar from "../components/Waybills/WaybillFilterBar.jsx";
import "../styles/layout.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const columns = [
  { label: "Waybill ID", key: "id" }, // Matches 'id' in DB
  { label: "Origin", key: "origin" },
  { label: "Destination", key: "destination" },
  { label: "Status", key: "status" },
  { label: "Logs", key: "log_count" },
  {
    label: "Last Update",
    key: "last_updated",
  },
];

const mockWaybills = [
  {
    id: "wb-001",
    waybill_number: "WB-2026-001",
    status: "IN_TRANSIT",
    origin_name: "Manila Hub",
    destination_name: "Davao Port",
    truck_plate: "NKR-1234",
    driver_name: "Ricardo Dalisay",
    client_name: "Toyota PH",
    expected_quantity: 50,
    actual_quantity: 50,
    last_updated: "2025-02-14T08:30:00Z",
  },
  {
    id: "wb-002",
    waybill_number: "WB-2026-002",
    status: "ADVICE",
    origin_name: "Batangas Plant",
    destination_name: "Manila Hub",
    truck_plate: "NQR-5678",
    driver_name: "Juan Luna",
    client_name: "Mitsubishi Motors",
    expected_quantity: 30,
    actual_quantity: 0,
    last_updated: "2026-02-24T09:15:00Z",
  },
  {
    id: "wb-003",
    status: "ARRIVED",
    waybill_number: "WB-2026-003",
    origin_name: "Cebu Logistics",
    destination_name: "Iloilo Warehouse",
    truck_plate: "ELF-9999",
    driver_name: "Maria Clara",
    client_name: "Isuzu PH",
    expected_quantity: 25,
    actual_quantity: 22,
    last_updated: "2026-02-24T10:05:00Z",
  },
];

export default function Waybills() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/waybills`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Waybills</h1>

      <WaybillFilterBar
      // searchWaybill={searchWaybill}
      // setSearchWaybill={setSearchWaybill}
      />

      <GenericTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate("/waybill_logs")}
      />
    </div>
  );
}

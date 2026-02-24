import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericTable from "../components/GenericTable.jsx";
import WaybillFilterBar from "../components/WaybillFilterBar.jsx";
import "../styles/layout.css";

const columns = [
  { label: "Waybill", key: "waybill_number" },
  { label: "Client", key: "client_name" },
  {
    label: "Origin/Dest",
    key: "origin_name",
    render: (_, row) => (
      <div style={{ fontSize: "0.85rem" }}>
        <strong>{row.origin_name}</strong> → {row.destination_name}
      </div>
    ),
  },
  { label: "Driver", key: "driver_name" },
  { label: "Truck", key: "truck_plate" },
  {
    label: "Status",
    key: "status",
    render: (status) => (
      <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
    ),
  },
  {
    label: "Qty (Act/Exp)",
    key: "actual_quantity",
    render: (_, row) => {
      const isMismatch = row.actual_quantity !== row.expected_quantity;
      return (
        <span
          style={{
            color: isMismatch ? "red" : "inherit",
            fontWeight: isMismatch ? "bold" : "normal",
          }}
        >
          {row.actual_quantity} / {row.expected_quantity}
        </span>
      );
    },
  },
  {
    label: "Last Update",
    key: "last_updated",
    // render: (val) =>
    //   new Date(val).toLocaleTimeString([], {
    //     month: "short",
    //     day: "2-digit",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //   }),
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
    actual_quantity: 0, // Nothing scanned yet
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
    actual_quantity: 22, // 3 Missing/Ghost units!
    last_updated: "2026-02-24T10:05:00Z",
  },
];

export default function Waybills() {
  const navigate = useNavigate();
  // const [movements] = useState(mockMovements);
  // const [searchWaybill, setSearchWaybill] = useState("");

  // const filtered = movements.filter((m) => {
  //   return m.waybill.toLowerCase().includes(searchWaybill.toLowerCase());
  // });

  return (
    <div className="page">
      <h1 className="page-title">Waybills</h1>

      <WaybillFilterBar
      // searchWaybill={searchWaybill}
      // setSearchWaybill={setSearchWaybill}
      />

      <GenericTable
        columns={columns}
        data={mockWaybills}
        onRowClick={(row) => navigate("/waybill_logs")}
      />
    </div>
  );
}

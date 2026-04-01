import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import WaybillHeader from "../components/Waybills/WaybillHeader";
import GenericTable from "../components/GenericTable";

const logColumns = [
  { label: "Status", key: "status" },
  {
    label: "Route",
    key: "route",
    render: (val, row) => `${row.origin} → ${row.destination}`,
  },
  { label: "Truck", key: "truck" },
  { label: "Driver", key: "driver" },
  {
    label: "Photos",
    key: "photos",
    render: (val, row) => (
      <div className="flex gap-2">
        {row.departure_photo_url && <span title="Departure Photo">📤</span>}
        {row.arrival_photo_url && <span title="Arrival Photo">📥</span>}
        {!row.departure_photo_url && !row.arrival_photo_url && "---"}
      </div>
    ),
  },
  {
    label: "Effective Start",
    key: "eff_start",
    render: (val) => new Date(val).toLocaleString(),
  },
  {
    label: "Active",
    key: "is_current",
    render: (val) => (
      <span
        className={`badge ${val ? "text-green-600 font-bold" : "text-gray-400"}`}
      >
        {val ? "● Current" : "○ Previous"}
      </span>
    ),
  },
];

const adviceColumns = [
  { label: "Advice ID", key: "id" },
  { label: "Client", key: "client" },
  {
    label: "Route",
    render: (_, row) => (
      <div style={{ fontSize: "0.85rem" }}>
        <strong>{row.origin}</strong>
        <span style={{ margin: "0 5px", color: "#666" }}>→</span>
        {row.destination}
      </div>
    ),
  },
  {
    label: "Driver",
    key: "driver",
    render: (val) => val ?? "---",
  },
  {
    label: "Truck",
    key: "truck",
    render: (val) => val ?? "---",
  },
  {
    label: "Expected Quantity",
    key: "expected_quantity",
    render: (val) => val ?? "0", // Or "---" if you prefer
  },
  { label: "Created At", key: "created_at" },
];

const scanColumns = [
  { label: "Scanned Value", key: "scan" },
  { label: "Match Status", key: "status" },
  { label: "Scan Time", key: "timestamp" },
  {
    label: "Log Ref",
    key: "waybill_log_id",
    render: (val) => <small>Log: {val}</small>,
  },
];

export default function WaybillLogs() {
  const { id } = useParams();
  const [waybillData, setWaybillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getWaybillInfo(id)
      .then((data) => {
        setWaybillData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading Waybill {id}...</div>;
  if (!waybillData) return <div>Waybill not found.</div>;

  if (!waybillData) return <div>⚠️ Waybill not found.</div>;
  console.log("advice ", waybillData.advice);
  return (
    <div className="page">
      <WaybillHeader waybill={waybillData.details} />

      <h1 className="page-title">Waybill Logs</h1>
      <GenericTable
        columns={logColumns}
        data={waybillData.stateHistory}
        emptyMessage="No activity logged for this waybill yet."
      />

      <hr className="divider" />

      <h1 className="page-title">Waybill Advice</h1>
      <GenericTable
        columns={adviceColumns}
        data={waybillData.advice ? [waybillData.advice] : []}
        emptyMessage="No advice logged"
      />

      <hr className="divider" />

      <h1 className="page-title">Unit Scan In</h1>
      {/* <GenericTable
        columns={scanColumns}
        data={scansIn}
        emptyMessage="No scans recorded for this session."
      />

      <hr className="divider" />

      <h1 className="page-title">Unit Scan Out</h1>
      <GenericTable
        columns={scanColumns}
        data={scansOut}
        emptyMessage="No scans recorded for this session."
      /> */}
    </div>
  );
}

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
    render: (val) => val ?? "0", 
  },
  { label: "Created At", key: "created_at" },
];

const scanColumns = [
  { label: "Manifest ID", key: "id" },
  { label: "Unit ID", key: "unit_id" },
  { label: "Unit Engine", key: "engine" },
  { label: "User", key: "user_id" },
  { label: "Created At", key: "created_at" },
];

const unitAdviceColumns = [
  { label: "Unit Advice ID", key: "id" },
  { label: "Waybill Advice ID", key: "advice_id" },
  { label: "Unit ID", key: "unit_id" },
  { label: "Unit Engine", key: "engine" },
  { label: "Created At", key: "created_at" },
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

  const departureManifest =
    waybillData.manifest?.filter(
      (item) => item.manifest_type === "DEPARTURE",
    ) || [];

  const arrivalManifest =
    waybillData.manifest?.filter((item) => item.manifest_type === "ARRIVAL") ||
    [];

  return (
    <div className="page">
      <WaybillHeader waybill={waybillData.details} />

      <h1 className="page-title">Waybill Logs</h1>
      <GenericTable
        columns={logColumns}
        data={waybillData.stateHistory}
        emptyMessage="No activity logged for this waybill yet."
      />

      {departureManifest.length > 0 && (
        <>
          <hr className="divider" />
          <h1 className="page-title">Units at Departure</h1>
          <GenericTable
            columns={scanColumns}
            data={departureManifest}
            emptyMessage="No units recorded"
          />
        </>
      )}

      {arrivalManifest.length > 0 && (
        <>
          <hr className="divider" />
          <h1 className="page-title">Units at Arrival</h1>
          <GenericTable
            columns={scanColumns}
            data={arrivalManifest}
            emptyMessage="No units recorded"
          />
        </>
      )}

      <hr className="divider" />

      <h1 className="page-title">Waybill Advice</h1>
      <GenericTable
        columns={adviceColumns}
        data={waybillData.advice ? [waybillData.advice] : []}
        emptyMessage="No advice logged"
      />

      <hr className="divider" />

      <h1 className="page-title">Unit Advice</h1>
      <GenericTable
        columns={unitAdviceColumns}
        data={waybillData.unitAdvice}
        emptyMessage="No advice logged"
      />
    </div>
  );
}

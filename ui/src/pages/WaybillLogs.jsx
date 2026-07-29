import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
    label: "Current?",
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

const scanColumns = [
  { label: "Waybill ID", key: "waybill_id" },
  { label: "Unit Engine", key: "engine" },
  { label: "User", key: "user_id" },
  {
    label: "Created At",
    key: "created_at",
    render: (val) => new Date(val).toLocaleString(),
  },
  {
    label: "Flag",
    key: "is_unexpected",
    render: (val) =>
      val ? (
        <span className="text-red-600 font-bold" title="Unit was not in a prior stage">
          ⚠️ Unexpected
        </span>
      ) : (
        <span className="text-green-600"></span>
      ),
  },
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

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    setNetworkError(null);
    api
      .getWaybillInfo(id)
      .then((data) => {
        setWaybillData(data);
      })
      .catch((err) => {
        setNetworkError("Failed to load logistics form data. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, [id, user, authLoading]);

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;
  if (!waybillData) return <div>⚠️ Waybill not found.</div>;

  const departureManifest =
    waybillData.manifest?.filter(
      (item) => item.manifest_type === "DEPARTURE",
    ) || [];

  const arrivalManifest =
    waybillData.manifest?.filter((item) => item.manifest_type === "ARRIVAL") ||
    [];

  const adviceManifest =
    waybillData.manifest?.filter((item) => item.manifest_type === "ADVICE") ||
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

      {adviceManifest.length > 0 && (
        <>
          <hr className="divider" />

          <h1 className="page-title">Unit Advice</h1>
          <GenericTable
            columns={scanColumns}
            data={adviceManifest}
            emptyMessage="No advice logged"
          />
        </>
      )}
    </div>
  );
}

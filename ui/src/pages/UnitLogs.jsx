import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UnitHeader from "../components/Units/UnitHeader";
import GenericTable from "../components/GenericTable";
import { api } from "../services/api";

const unitLogColumns = [
  { label: "Engine", key: "engine" },
  { label: "Frame", key: "frame" },
  { label: "Model", key: "model" },
  { label: "Color", key: "color" },
  { label: "DA", key: "da" },
  { label: "Current Location", key: "last_known_location" },
  { label: "Status", key: "status" },
  {
    label: "Start",
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

const manifestColumns = [
  { label: "Waybill ID", key: "waybill_id" },
  { label: "Status", key: "manifest_type" },
  { label: "User", key: "user_id" },
  {
    label: "Created At",
    key: "created_at",
    render: (val) => new Date(val).toLocaleString(),
  },
];


export default function UnitLogs() {
  
  const navigate = useNavigate();
  const { unitID } = useParams();
  const [unitData, setUnitData] = useState(null);
  const [manifestData, setManifestData] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    setNetworkError(null);

    Promise.all([api.getUnitHistory(unitID), api.getUnitManifest(unitID)])
      .then(([data, manifest]) => {
        setUnitData(data);
        setManifestData(manifest);
      })
      .catch((err) => {
        console.error(err);
        setNetworkError("Failed to load logistics form data. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, [unitID, user, authLoading]);

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;
  if (!unitData) return <div>Unit not found.</div>;

  return (
    <div className="page">
      <UnitHeader unit={unitData.details} />{" "}
      {manifestData.length > 0 && (
        <>
          <h1 className="page-title">Unit History</h1>
          <GenericTable
            columns={manifestColumns}
            data={manifestData}
            emptyMessage="No advice logged"
            onRowClick={(row) => navigate("/waybill_logs/" + row.waybill_id)}
          />
        </>
      )}
      <hr className="divider" />
      <h1 className="page-title">Unit Logs</h1>
      <GenericTable
        columns={unitLogColumns}
        data={unitData.stateHistory || []}
        emptyMessage="No movement history found for this engine."
      />
    </div>
  );
}

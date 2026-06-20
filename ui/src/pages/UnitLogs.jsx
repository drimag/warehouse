import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  { label: "Start", key: "eff_start" },
  { label: "End", key: "eff_end" },
  {
    label: "isCurrent?",
    key: "is_current",
    render: (val) => (val ? "Yes" : "No"),
  },
];

export default function UnitLogs() {
  const { unitID } = useParams();
  const [unitData, setUnitData] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    setNetworkError(null);

    api
      .getUnitHistory(unitID)
      .then((data) => {
        setUnitData(data);
      })
      .catch((err) => {
        console.error(err);
        setNetworkError("Failed to load logistics form data. Please refresh.");
      })
      .finally(setLoading(false));
  }, [unitID, user, authLoading]);

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;
  if (!unitData) return <div>Unit not found.</div>;

  return (
    <div className="page">
      <UnitHeader unit={unitData.details} />
      <h1 className="page-title">Unit Logs</h1>
      <GenericTable
        columns={unitLogColumns}
        data={unitData.stateHistory || []}
        emptyMessage="No movement history found for this engine."
      />
    </div>
  );
}

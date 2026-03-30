import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import UnitHeader from "../components/Units/UnitHeader";
import GenericTable from "../components/GenericTable";
import { api } from "../services/api";

const unitLogColumns = [
  { label: "Log ID", key: "id" },
  { label: "Unit ID", key: "unit_id" },
  { label: "Engine", key: "engine" },
  { label: "Frame", key: "frame" },
  { label: "Model", key: "model" },
  { label: "Color", key: "color" },
  { label: "DA", key: "da" },
  { label: "Current Location", key: "current_location" },
  { label: "Status", key: "status" },
  { label: "Start", key: "eff_start" },
  { label: "End", key: "eff_end" },
  { label: "isCurrent?", key: "is_current", render: (val) => (val ? "Yes" : "No") }
];

export default function UnitLogs() {
  const { unitID } = useParams();
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUnitHistory(unitID)
      .then((data) => {
        setUnitData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [unitID]);

  if (loading) return <div>Loading Unit {unitID}...</div>;
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

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import UnitHeader from "../components/Units/UnitHeader";
import GenericTable from "../components/GenericTable";
import { api } from "../services/api";

const unitLogColumns = [
  { label: "Event", key: "event" },
  { label: "Waybill Ref", key: "waybill_id" },
  { label: "Date & Time", key: "timestamp" },
  { label: "User", key: "user_id" },
];

export default function UnitLogs() {
  const { engine } = useParams();
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUnitHistory(engine)
      .then((data) => {
        setUnitData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [engine]);

  if (loading) return <div>Loading Unit {engine}...</div>;
  if (!unitData) return <div>Unit not found.</div>;

  return (
    <div className="page">
      <UnitHeader unit={unitData.details} />
      <h1 className="page-title">Unit Logs</h1>
      <GenericTable
        columns={unitLogColumns}
        data={unitData.history}
        emptyMessage="No movement history found for this engine."
      />
    </div>
  );
}

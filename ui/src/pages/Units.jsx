import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UnitFilters from "../components/Units/UnitFilters";
import GenericTable from "../components/GenericTable";
import { api } from "../services/api";

const unitColumns = [
  { label: "Engine No.", key: "engine" },
  { label: "Frame", key: "frame" },
  { label: "Model", key: "model" },
  { label: "Color", key: "color" },
  { label: "DA", key: "da" },
  { label: "Current Location", key: "current_location" },
  { label: "Status", key: "status" },
];

export default function Units() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getUnits()
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">🚚 Loading Shipments...</div>;
  if (error) return <div className="p-10 text-red-500">❌ Error: {error}</div>;

  return (
    <div className="page">
      <h1 className="page-title">Units</h1>

      <UnitFilters />
      <GenericTable
        columns={unitColumns}
        data={data}
        onRowClick={(row) => navigate("/unit_logs/" + row.id)}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';
import GenericTable from "../components/GenericTable.jsx";
import WaybillFilterBar from "../components/Waybills/WaybillFilterBar.jsx";
import "../styles/layout.css";

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


export default function Waybills() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getWaybills()
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">🚚 Loading Shipments...</div>;
  if (error) return <div className="p-10 text-red-500">❌ Error: {error}</div>;

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

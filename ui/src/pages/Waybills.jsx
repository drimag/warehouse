import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import GenericTable from "../components/GenericTable.jsx";
import WaybillFilterBar from "../components/Waybills/WaybillFilterBar.jsx";
import "../styles/layout.css";

const columns = [
  { label: "Waybill ID", key: "id" },
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
  { label: "Driver", key: "driver" },
  { label: "Truck", key: "truck" },
  { label: "Status", key: "status" },
  {
    label: "Qty (Act/Exp)",
    render: (_, row) => {
      const isMismatch = row.actual_qty !== row.expected_qty;
      return (
        <span
          style={{
            color: isMismatch ? "red" : "inherit",
            fontWeight: isMismatch ? "bold" : "normal",
          }}
        >
          {row.actual_qty} / {row.expected_qty}
        </span>
      );
    },
  },
  { label: "Last Update", key: "last_updated" },
];

export default function Waybills() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getWaybills()
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-10 text-center">🚚 Loading Shipments...</div>;
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

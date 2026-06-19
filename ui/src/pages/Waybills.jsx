import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
      const isMismatch =
        Number(row.actual_qty) !== Number(row.expected_quantity) && row.expected_quantity;
      return (
        <span
          style={{
            color: isMismatch ? "red" : "inherit",
            fontWeight: isMismatch ? "bold" : "normal",
          }}
        >
          {row.actual_qty} / {row.expected_quantity ? row.expected_quantity : "?"}
        </span>
      );
    },
  },
];

export default function Waybills() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    setNetworkError(null);
    api
      .getWaybills()
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setNetworkError("Failed to load logistics form data. Please refresh.");
      })
      .finally(setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;

  const filteredWaybills = data.filter((wb) => {
    const matchesSearch =
      wb.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wb.client?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || wb.status === statusFilter;

    const matchesDest =
      destFilter === "" || String(wb.destination_id) === destFilter;

    return matchesSearch && matchesStatus && matchesDest;
  });

  return (
    <div className="page">
      <h1 className="page-title">Waybills</h1>
      <div className="filter-bar">
        {/* Search Bar */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            SEARCH
          </label>
          <input
            type="text"
            placeholder="Waybill ID or Client..."
            className="border border-gray-300 p-2 rounded-md w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            STATUS
          </label>
          <select
            className="border border-gray-300 p-2 rounded-md bg-white min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ADVICE">Advice</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ARRIVED">Arrived</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Destination Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            DESTINATION
          </label>
          <select
            className="border border-gray-300 p-2 rounded-md bg-white min-w-[140px]"
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
          >
            <option value="">All Destinations</option>
            {/* Automatically generate unique destination options from data */}
            {data
              // 1. Filter out duplicates based on destination_id, and skip null/falsy values
              .filter(
                (wb, index, self) =>
                  wb?.destination_id &&
                  index ===
                    self.findIndex(
                      (t) => t.destination_id === wb.destination_id,
                    ),
              )
              // 2. Map into option elements using the human-readable text name
              .map((wb) => (
                <option key={wb.destination_id} value={wb.destination_id}>
                  {wb.destination || `Location ${wb.destination_id}`}
                </option>
              ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("");
            setDestFilter("");
          }}
          className="mt-5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <GenericTable
        columns={columns}
        data={filteredWaybills}
        onRowClick={(row) => navigate("/waybill_logs/" + row.id)}
      />
    </div>
  );
}

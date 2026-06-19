import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UnitFilters from "../components/Units/UnitFilters";
import GenericTable from "../components/GenericTable";
import { api } from "../services/api";

const unitColumns = [
  { label: "Engine No.", key: "engine" },
  { label: "Frame", key: "frame" },
  { label: "Model", key: "model" },
  { label: "Color", key: "color" },
  { label: "DA", key: "da" },
  { label: "Last Location", key: "last_known_location" },
  { label: "Status", key: "status" },
];

export default function Units() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    api
      .getUnits()
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setNetworkError("Failed to load logistics form data. Please refresh.");
      })
      .then(setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;

  const filteredData = data.filter((item) => {
    // Search Bar: Match engine OR frame
    const matchesSearch =
      item.engine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.frame?.toLowerCase().includes(searchTerm.toLowerCase());

    // Dropdown: Match status (if selected)
    const matchesStatus = statusFilter === "" || item.status === statusFilter;

    // Dropdown: Match location (if selected)
    const matchesLocation =
      locationFilter === "" || String(item.last_location_id) === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="page">
      <h1 className="page-title">Units</h1>

      <div className="filter-bar">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            SEARCH
          </label>
          <input
            type="text"
            placeholder="Search Engine or Frame..."
            className="border p-2 rounded w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            STATUS
          </label>
          <select
            className="border p-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="IN_STORAGE">IN_STORAGE</option>=
          </select>
        </div>

        {/* Location Dropdown */}

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            DESTINATION
          </label>
          <select
            className="border p-2 rounded"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {data
              .filter(
                (item, index, self) =>
                  index ===
                  self.findIndex(
                    (t) => t.last_location_id === item.last_location_id,
                  ),
              )
              .map((item) => (
                <option
                  key={item.last_location_id}
                  value={item.last_location_id}
                >
                  {item.last_known_location ||
                    `Location ${item.last_location_id}`}
                </option>
              ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("");
            setLocationFilter("");
          }}
          className="mt-5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Reset Filters
        </button>
      </div>
      <GenericTable
        columns={unitColumns}
        data={filteredData}
        onRowClick={(row) => navigate("/unit_logs/" + row.id)}
      />
    </div>
  );
}

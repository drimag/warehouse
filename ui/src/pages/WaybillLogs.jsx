import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import WaybillHeader from "../components/Waybills/WaybillHeader";
import GenericTable from "../components/GenericTable";
import UnitEditModal from "../components/UnitEditModal";

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
      <span className={`badge ${val ? "text-green-600 font-bold" : "text-gray-400"}`}>
        {val ? "● Current" : "○ Previous"}
      </span>
    ),
  },
];

const scanColumns = (onEditUnit, isAdmin) => [
  { label: "Waybill ID", key: "waybill_id" },
  { label: "Unit Engine", key: "engine" },
  { label: "User", key: "user_id" },
  {
    label: "Created At",
    key: "created_at",
    render: (val) => new Date(val).toLocaleString(),
  },
  {
    label: "Status",
    key: "is_unexpected",
    render: (val) =>
      val ? (
        <span className="text-red-600 font-bold" title="Unit was not in a prior stage">
          ⚠️ Unexpected
        </span>
      ) : (
        <span className="text-green-600">✓ OK</span>
      ),
  },
  // Edit button column — only rendered for admins
  ...(isAdmin
    ? [
        {
          label: "",
          key: "unit_id",
          render: (val) => (
            <button
              onClick={() => onEditUnit(val)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit Unit
            </button>
          ),
        },
      ]
    : []),
];

export default function WaybillLogs() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [waybillData, setWaybillData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // Close waybill state
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");

  // Unit edit modal state
  const [editingUnitId, setEditingUnitId] = useState(null);

  const isAdmin = user?.role === "ADMIN";

  // ── Fetch page data ──────────────────────────────────────────────────────

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setNetworkError(null);
      const [data, locs] = await Promise.all([
        api.getWaybillInfo(id),
        api.getLocations(),
      ]);
      setWaybillData(data);
      setLocations(locs);
    } catch (err) {
      console.error(err);
      setNetworkError("Failed to load waybill data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchPageData();
  }, [id, user, authLoading]);

  // ── Close waybill ────────────────────────────────────────────────────────

  const handleClose = async () => {
    const confirmed = window.confirm(
      "Mark this waybill as CLOSED?\n\nThis action cannot be undone."
    );
    if (!confirmed) return;

    setClosing(true);
    setCloseError("");
    try {
      await api.closeWaybill(id);
      await fetchPageData(); // Refresh to show updated status
    } catch (err) {
      setCloseError(err.response?.data?.error || "Failed to close waybill.");
    } finally {
      setClosing(false);
    }
  };

  // ── Render guards ────────────────────────────────────────────────────────

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;
  if (!waybillData) return <div>⚠️ Waybill not found.</div>;

  // ── Manifest filters ─────────────────────────────────────────────────────

  const departureManifest =
    waybillData.manifest?.filter((item) => item.manifest_type === "DEPARTURE") || [];

  const arrivalManifest =
    waybillData.manifest?.filter((item) => item.manifest_type === "ARRIVAL") || [];

  const adviceManifest =
    waybillData.manifest?.filter((item) => item.manifest_type === "ADVICE") || [];

  const hasUnexpectedDepartures = departureManifest.some((r) => r.is_unexpected);
  const hasUnexpectedArrivals = arrivalManifest.some((r) => r.is_unexpected);

  const details = waybillData.details;
  const columns = scanColumns((unitId) => setEditingUnitId(unitId), isAdmin);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <WaybillHeader waybill={details} />

      {/* Close waybill — only shown to ADMIN when status is ARRIVED */}
      {isAdmin && details?.status === "ARRIVED" && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Ready to close this waybill?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              All arrived units must match the expected quantity before closing.
            </p>
            {closeError && (
              <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {closeError}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={closing}
            className="shrink-0 px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-sm font-medium rounded transition-colors"
          >
            {closing ? "Closing..." : "✓ Mark as Closed"}
          </button>
        </div>
      )}

      {/* Waybill logs */}
      <h1 className="page-title">Waybill Logs</h1>
      <GenericTable
        columns={logColumns}
        data={waybillData.stateHistory}
        emptyMessage="No activity logged for this waybill yet."
      />

      {/* Arrival manifest */}
      {arrivalManifest.length > 0 && (
        <>
          <hr className="divider" />
          <h1 className="page-title">
            Units at Arrival
            {hasUnexpectedArrivals && (
              <span className="text-red-500 text-sm font-normal ml-2">
                ⚠️ Contains unexpected units
              </span>
            )}
          </h1>
          <GenericTable
            columns={columns}
            data={arrivalManifest}
            emptyMessage="No units recorded"
          />
        </>
      )}

      {/* Departure manifest */}
      {departureManifest.length > 0 && (
        <>
          <hr className="divider" />
          <h1 className="page-title">
            Units at Departure
            {hasUnexpectedDepartures && (
              <span className="text-red-500 text-sm font-normal ml-2">
                ⚠️ Contains unexpected units
              </span>
            )}
          </h1>
          <GenericTable
            columns={columns}
            data={departureManifest}
            emptyMessage="No units recorded"
          />
        </>
      )}

      {/* Advice manifest */}
      {adviceManifest.length > 0 && (
        <>
          <hr className="divider" />
          <h1 className="page-title">Unit Advice</h1>
          <GenericTable
            columns={columns}
            data={adviceManifest}
            emptyMessage="No advice logged"
          />
        </>
      )}

      {/* Unit edit modal */}
      {editingUnitId && (
        <UnitEditModal
          unitId={editingUnitId}
          locations={locations}
          onClose={() => setEditingUnitId(null)}
          onSaved={() => {
            setEditingUnitId(null);
            fetchPageData(); // Refresh manifests to reflect any unit changes
          }}
        />
      )}
    </div>
  );
}

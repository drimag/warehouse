import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

// ── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (val) =>
  val ? new Date(val).toLocaleString() : "—";

const formatDateShort = (val) =>
  val ? new Date(val).toLocaleDateString() : "—";

// ── Sub-components ─────────────────────────────────────────────────────────

const StatusBadge = ({ children, variant }) => {
  const styles = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error:   "bg-red-100 text-red-700 border border-red-200",
    info:    "bg-blue-100 text-blue-800 border border-blue-200",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

const ArchiveTable = ({ archives }) => {
  if (archives.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
        <p className="text-2xl mb-2">🗂️</p>
        <p className="text-sm">No archives yet. Run your first archive to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["File", "Waybills", "Date Range", "Triggered By", "Created At", "Download"].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {archives.map((a, i) => (
            <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                {a.file_name}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-semibold text-gray-800">{a.waybill_count}</span>
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                {formatDateShort(a.date_from)} → {formatDateShort(a.date_to)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {a.created_by === "system" ? (
                  <span className="text-gray-400 italic">Auto (cron)</span>
                ) : (
                  a.created_by
                )}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatDate(a.created_at)}
              </td>
              <td className="px-4 py-3">
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  📥 Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ArchiveManager() {
  const { user, loading: authLoading } = useAuth();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // Archive run state
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null); // { success, message, fileUrl? }

  // ── Fetch archive history ──────────────────────────────────────────────

  const fetchArchives = async () => {
    try {
      setLoading(true);
      setNetworkError(null);
      const data = await api.listArchives();
      setArchives(data);
    } catch (err) {
      console.error(err);
      setNetworkError("Failed to load archive history. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchArchives();
  }, [user, authLoading]);

  // ── Manual archive trigger ─────────────────────────────────────────────

  const handleRunArchive = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all CLOSED waybills older than 1 week from the database and export them to an Excel file on Cloudinary.\n\nThis cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setRunning(true);
    setRunResult(null);

    try {
      const result = await api.runArchive();
      setRunResult({
        success: true,
        message: result.message,
        fileUrl: result.fileUrl ?? null,
      });
      // Refresh the table to show the new archive entry
      await fetchArchives();
    } catch (err) {
      console.error(err);
      setRunResult({
        success: false,
        message:
          err.response?.data?.error ||
          "Archive failed. No data was deleted — check server logs.",
      });
    } finally {
      setRunning(false);
    }
  };

  // ── Render guards ──────────────────────────────────────────────────────

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <h1 className="page-title">Archive Manager</h1>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>⚠️ How archiving works:</strong> Closed waybills older than 1 week are exported
        to an Excel file on Cloudinary and then <strong>permanently deleted</strong> from the
        database. This runs automatically every <strong>Sunday at 2AM</strong>. You can also
        trigger it manually below.
      </div>

      {/* Manual trigger */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-white">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Manual Archive</h2>
        <p className="text-sm text-gray-500 mb-4">
          Runs the same process as the weekly cron job immediately.
        </p>

        <button
          onClick={handleRunArchive}
          disabled={running}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-5 py-2 rounded font-medium text-sm transition-colors"
        >
          {running ? "⏳ Archiving..." : "🗂️ Run Archive Now"}
        </button>

        {/* Run result feedback */}
        {runResult && (
          <div className="mt-4">
            <StatusBadge variant={runResult.success ? "success" : "error"}>
              {runResult.success ? "✓" : "✕"} {runResult.message}
            </StatusBadge>
            {runResult.success && runResult.fileUrl && (
              <a
                href={runResult.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-sm text-blue-600 underline hover:text-blue-800"
              >
                Open file →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Archive history */}
      <h2 className="page-title">Archive History</h2>
      <ArchiveTable archives={archives} />
    </div>
  );
}

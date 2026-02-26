import { useNavigate } from "react-router-dom";
export default function UnitConfirm({ unit, onConfirm, onCancel }) {
  const navigate = useNavigate();
  return (
    <div className="scan-result confirm-card">
      <h1>Confirm Unit Details</h1>

      <section className="confirm-section">
        <h3>Identity & Specs</h3>
        <p>
          <strong>Engine No:</strong> {unit?.engine || "N/A"}
        </p>
        <p>
          <strong>Frame No:</strong> {unit?.frame || "N/A"}
        </p>
        <p>
          <strong>Model:</strong> {unit?.model || "Unknown Model"}
        </p>
        <p>
          <strong>Color:</strong> {unit?.color || "Not Specified"}
        </p>
      </section>

      <section className="confirm-section">
        <h3>Logistics Info</h3>
        <p>
          <strong>DA Number:</strong> {unit?.da || "No DA Assigned"}
        </p>
        <p>
          <strong>Current Warehouse:</strong>{" "}
          {unit?.current_warehouse || "Unknown Location"}
        </p>
        <p>
          <strong>Status:</strong> {unit?.status || "PENDING"}
        </p>
      </section>

      <div className="warehouse-row">
        <button className="primary-btn" onClick={onCancel}>
          Edit
        </button>
        <button className="primary-btn" onClick={onConfirm}>
          Confirm & Save
        </button>
      </div>
    </div>
  );
}

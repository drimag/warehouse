import { useNavigate } from "react-router-dom";
export default function UnitConfirm({ unit, onConfirm }) {
  const navigate = useNavigate();
  return (
    <div className="scan-result confirm-card">
      <h1>Unit Successfully Uploaded</h1>

        <p>
          <strong>Engine No:</strong> {unit?.engine || "Unknown"}
        </p>
        <p>
          <strong>Frame No:</strong> {unit?.frame || "Unknown"}
        </p>
        <p>
          <strong>Model:</strong> {unit?.model || "Unknown"}
        </p>
        <p>
          <strong>Color:</strong> {unit?.color || "Unknown"}
        </p>

      <p>
        <strong>DA Number:</strong> {unit?.da || "Unknown"}
      </p>
      <p>
        <strong>Last Known Location:</strong>{" "}
        {unit?.lastLocation || "Unknown"}
      </p>
      <p>
        <strong>Status:</strong> {unit?.status || "Unknown"}
      </p>

      <div className="warehouse-row">
        <button className="primary-btn" onClick={onConfirm}>
          Ok
        </button>
      </div>
    </div>
  );
}

export default function ActionSelector({ action, setAction }) {
  return (
    <div className="scan-field">
      <label>Status</label>
      <div className="action-buttons">
        <button
          className={action === "STORED" ? "active" : ""}
          onClick={() => setAction("STORED")}
        >
          STORED
        </button>
        <button
          className={action === "IN_TRANSIT" ? "active" : ""}
          onClick={() => setAction("IN_TRANSIT")}
        >
          IN_TRANSIT
        </button>
        <button
          className={action === "PENDING" ? "active" : ""}
          onClick={() => setAction("PENDING")}
        >
          PENDING
        </button>
      </div>
    </div>
  );
}
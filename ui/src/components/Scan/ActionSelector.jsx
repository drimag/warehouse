export default function ActionSelector({ action, setAction }) {
  return (
    <div className="scan-field">
      <label>Status</label>
      <div className="action-buttons">
        <button
          className={action === "receive" ? "active" : ""}
          onClick={() => setAction("receive")}
        >
          Receive Unit
        </button>
        <button
          className={action === "send" ? "active" : ""}
          onClick={() => setAction("send")}
        >
          Transfer Unit
        </button>
        <button
          className={action === "pending" ? "active" : ""}
          onClick={() => setAction("pending")}
        >
          Pending
        </button>
      </div>
    </div>
  );
}
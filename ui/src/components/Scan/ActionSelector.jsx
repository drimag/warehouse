export default function ActionSelector({ action, setAction }) {
  return (
    <div className="scan-field">
      <label>Action</label>
      <div className="action-buttons">
        <button
          className={action === "receive" ? "active" : ""}
          onClick={() => setAction("receive")}
        >
          Receive
        </button>
        <button
          className={action === "send" ? "active" : ""}
          onClick={() => setAction("send")}
        >
          Send
        </button>
      </div>
    </div>
  );
}
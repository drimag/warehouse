export default function WaybillConfirm({
  waybill,
  status,
  origin,
  destination,
  user,
  type,
  handleSubmit
}) {
  return (
    <div className="scan-result">
      <h1>Confirm Details</h1>
      <p>
        <strong>Waybill Name:</strong> {waybill ? waybill : "Waybill Name"}
      </p>
      <p>
        <strong>Waybill Code:</strong> {"WB-001"}
      </p>
      <p>
        <strong>Status:</strong> {status ? status : "Unknown Status"}
      </p>
      <p>
        <strong>Origin:</strong> {origin ? origin : "Unknown"}
      </p>
      <p>
        <strong>Destination:</strong> {destination ? destination : "Unknown"}
      </p>
      <p>
        <strong>Client:</strong> {"Client"}
      </p>
      <h1>Advice</h1>
      <p>
        <strong>Type:</strong> {type ? type : "Unknown Type"}
      </p>
      <p>
        <strong>Expected Time:</strong> {type ? type : "Unknown Time"}
      </p>
      <p>
        <strong>Expected Quantity:</strong> {type ? type : "Unknown"}
      </p>
      <p>
        <strong>Timestamp:</strong> {type ? type : "Unknown"}
      </p>
      <p>
        <strong>User:</strong> {user ? user : "Unknown User"}
      </p>
      <button className="primary-btn" onClick={handleSubmit}>
        Confirm
      </button>
    </div>
  );
}

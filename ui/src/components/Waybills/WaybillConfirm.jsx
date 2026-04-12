export default function WaybillConfirm({
  waybill,
  handleSubmit
}) {
  return (
    <div className="scan-result">
      <h1>Confirm Details</h1>
      <p>
        <strong>Waybill ID:</strong> {waybill.id}
      </p>
      <p>
        <strong>Status:</strong> {waybill.status ? waybill.status : "Unknown Status"}
      </p>
      <p>
        <strong>Origin:</strong> {waybill.origin ? waybill.origin : "Unknown Origin"}
      </p>
      <p>
        <strong>Destination:</strong> {waybill.destination ? waybill.destination : "Unknown Destination"}
      </p>
      <p>
        <strong>Client:</strong> {waybill.client ? waybill.client : "Unknownd Client"}
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

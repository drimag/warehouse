export default function WaybillResult({
  waybill,
  driver,
  truck,
  time,
  status,
  origin,
  destination,
  inout,
  quantity,
  photo,
  user,
  handleSubmit
}) {
  return (
    <div className="scan-result">
      <h1>Confirm Details</h1>
      <p>
        <strong>Waybill:</strong> {waybill ? waybill : "Unknown Waybill"}
      </p>
      <p>
        <strong>Driver:</strong> {driver ? driver : "Unknown Driver"}
      </p>
      <p>
        <strong>Truck:</strong> {truck ? truck : "Unknown Truck"}
      </p>
      <p>
        <strong>Time:</strong> {time ? time : "Unknown Time"}
      </p>
      <p>
        <strong>Status:</strong> {status ? status : "Unknown Status"}
      </p>
      <p>
        <strong>Origin:</strong> {origin}
      </p>
      <p>
        <strong>Destination:</strong> {destination}
      </p>
      <p>
        <strong>In/Out:</strong> {inout ? inout : "Unknown Movement"}
      </p>
      <p>
        <strong>Quantity:</strong> {quantity ? quantity : "Unknown Quantity"}
      </p>
      <p>
        <strong>Photo:</strong>
      </p>
      {photo ? (
        <div className="result-photo-container">
          <img src={photo} alt="Scan attachment" className="preview-small" />
        </div>
      ) : (
        <p>No Attached Photo</p>
      )}
      <p>
        <strong>User:</strong> {user ? user : "Unknown User"}
      </p>

      <button className="primary-btn" onClick={handleSubmit}>
        Confirm
      </button>
    </div>
  );
}

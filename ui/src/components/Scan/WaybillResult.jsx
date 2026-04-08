export default function WaybillResult({
  waybill,
  driver,
  truck,
  status,
  origin,
  destination,
  quantity,
  photo,
  user
}) {
  return (
    <div className="scan-result">
      <h1>Confirm Details</h1>
      <p>
        <strong>Waybill:</strong> {waybill ? waybill : "Unknown Waybill"}
      </p>
      <p>
        <strong>
          {status === "IN_TRANSIT"
            ? "For Departure"
            : status === "ARRIVAL"
              ? "For Arrival"
              : ""}
        </strong>
      </p>
      <p>
        <strong>Driver:</strong> {driver ? driver : "Unknown Driver"}
      </p>
      <p>
        <strong>Truck:</strong> {truck ? truck : "Unknown Truck"}
      </p>
      <p>
        <strong>Origin:</strong> {origin}
      </p>
      <p>
        <strong>Destination:</strong> {destination}
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
    </div>
  );
}

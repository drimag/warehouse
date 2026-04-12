export default function WaybillResult({
  waybill,
  quantity,
  photo,
  user
}) {
  console.log("selected waybill", waybill);
  return (
    <div className="scan-result">
      <h1>Confirm Details</h1>
      <p>
        <strong>Waybill:</strong> {waybill.id ? waybill.id : "Unknown Waybill"}
      </p>
      <p>
        <strong>
          {waybill.status === "IN_TRANSIT"
            ? "For Departure"
            : status === "ARRIVAL"
              ? "For Arrival"
              : ""}
        </strong>
      </p>
      {/* <p>
        <strong>Driver:</strong> {waybill.driver ? waybill.driver : "Unknown Driver"}
      </p>
      <p>
        <strong>Truck:</strong> {waybill.truck ? waybill.truck : "Unknown Truck"}
      </p>
      <p>
        <strong>Origin:</strong> {waybill.origin}
      </p>
      <p>
        <strong>Destination:</strong> {waybill.destination}
      </p>*/}
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

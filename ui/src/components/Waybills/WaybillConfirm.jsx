export default function WaybillConfirm({
  waybill,
  setSubmitted,
}) {
  console.log("waybill: ", waybill);
  return (
    <div className="scan-result">
      <h1>Confirm Details</h1>
      <p>
        <strong>Waybill ID:</strong> {waybill.id}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {waybill.status ? waybill.status : "Unknown Status"}
      </p>
      <p>
        <strong>Origin:</strong>{" "}
        {waybill.origin ? waybill.origin : "Unknown Origin"}
      </p>
      <p>
        <strong>Destination:</strong>{" "}
        {waybill.destination ? waybill.destination : "Unknown Destination"}
      </p>
      <p>
        <strong>Client:</strong>{" "}
        {waybill.client ? waybill.client : "Unknownd Client"}
      </p>
      <p>
        <strong>Driver:</strong>{" "}
        {waybill.driver ? waybill.driver : "Unknownd Driver"}
      </p>
      <p>
        <strong>Truck:</strong>{" "}
        {waybill.truck ? waybill.truck : "Unknownd Truck"}
      </p>
      {waybill.status === "ADVICE" && (
        <>
          <h1>Advice</h1>
          <p>
            <strong>Expected Date of Arrival:</strong>{" "}
            {waybill.expectedDate ? waybill.expectedDate : "Unknown Time"}
          </p>
          <p>
            <strong>Expected Quantity:</strong>{" "}
            {waybill.expectedQty ? waybill.expectedQty : "Unknown"}
          </p>
        </>
      )}
      <div className="warehouse-row">
        <button className="primary-btn" onClick={() => setSubmitted(false)}>
          Ok
        </button>
      </div>
    </div>
  );
}

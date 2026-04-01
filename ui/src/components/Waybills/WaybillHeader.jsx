export default function WaybillHeader({ waybill }) {
  const qtyColor =
    (waybill.actual_qty !== waybill.expected_qty) && waybill.expected_qty ? "red" : "inherit";

  return (
    <div className="unit-header">
      <h1 className="page-title">Waybill ID: {waybill.id}</h1>

      <div className="unit-meta">
        {/* Client & Status */}
        <span>
          <strong>Client:</strong> {waybill.client}
        </span>
        <span>
          <strong>Status:</strong> {waybill.status}
        </span>

        {/* Route Info */}
        <span>
          <strong>From:</strong> {waybill.origin}
        </span>
        <span>
          <strong>To:</strong> {waybill.destination}
        </span>

        {/* Transport Info */}
        <span>
          <strong>Driver:</strong> {waybill.driver}
        </span>
        <span>
          <strong>Truck:</strong> {waybill.truck}
        </span>

        {/* Quantities & Time */}
        <span style={{ color: qtyColor }}>
          <strong>Quantity:</strong> {waybill.actual_qty} /{" "}
          {waybill.expected_qty}
        </span>

        <span>
          <strong>Last Update:</strong> {waybill.last_updated}
        </span>
      </div>
    </div>
  );
}

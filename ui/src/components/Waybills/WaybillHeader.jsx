export default function WaybillHeader({ waybill }) {
  // Simple check for quantity alert
  const qtyColor = waybill.actual_quantity !== waybill.expected_quantity ? "red" : "inherit";

  return (
    <div className="unit-header">
      <h1 className="page-title">Waybill: {waybill.waybill_number}</h1>
      
      <div className="unit-meta">
        {/* Client & Status */}
        <span><strong>Client:</strong> {waybill.client_name}</span>
        <span><strong>Status:</strong> {waybill.status}</span>
        
        {/* Route Info */}
        <span><strong>From:</strong> {waybill.origin_name}</span>
        <span><strong>To:</strong> {waybill.destination_name}</span>
        
        {/* Transport Info */}
        <span><strong>Driver:</strong> {waybill.driver_name}</span>
        <span><strong>Truck:</strong> {waybill.truck_plate}</span>
        
        {/* Quantities & Time */}
        <span style={{ color: qtyColor }}>
          <strong>Quantity:</strong> {waybill.actual_quantity} / {waybill.expected_quantity}
        </span>
        
        <span><strong>Last Update:</strong> {waybill.last_updated}</span>
      </div>
    </div>
  );
}
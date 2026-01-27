export default function ScanResult({ vin, action, warehouse }) {
  return (
    <div className="scan-result">
      <h3>Success</h3>
      <p><strong>VIN:</strong> {vin}</p>
      <p><strong>Status:</strong> {action}</p>
      <p><strong>Warehouse:</strong> {warehouse}</p>
    </div>
  );
}
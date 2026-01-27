export default function ScanResult({ vin, action, warehouse1, warehouse2 }) {
  return (
    <div className="scan-result">
      <h3>Success</h3>
      <p><strong>VIN:</strong> {vin}</p>
      <p><strong>Status:</strong> {action}</p>
      <p><strong>Origin:</strong> {warehouse1}</p>
      <p><strong>Destination:</strong> {warehouse2}</p>
    </div>
  );
}
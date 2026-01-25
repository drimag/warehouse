export default function ScanInput({ vin, setVin }) {
  return (
    <div className="scan-field">
      <label>VIN</label>
      <input
        type="text"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
        placeholder="Scan or type VIN"
        autoFocus
      />
    </div>
  );
}
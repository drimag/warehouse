export default function ScanInput({ vin, setVin, title }) {
  return (
    <div className="scan-field">
      <label>{title}</label>
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
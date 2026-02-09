export default function VinSearch({ value, onChange }) {
  return (
    <input
      className="input"
      placeholder="Search VIN, Engine, or Frame"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
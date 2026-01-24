export default function VinSearch({ value, onChange }) {
  return (
    <input
      className="input"
      placeholder="Search VIN"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
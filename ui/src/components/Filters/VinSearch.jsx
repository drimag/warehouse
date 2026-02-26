export default function VinSearch({ value, onChange }) {
  return (
    <input
      className="input"
      placeholder="Search Engine or Frame"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
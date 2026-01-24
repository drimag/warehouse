export default function StatusFilter({ value, onChange }) {
  const statuses = ["ALL", "STORED", "IN_TRANSIT", "PENDING"];

  return (
    <select
      className="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {statuses.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  );
}
export default function WarehouseFilter({ value, onChange }) {
  const warehouses = ["ALL", "Warehouse A", "Warehouse B"];

  return (
    <select
      className="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {warehouses.map((w) => (
        <option key={w}>{w}</option>
      ))}
    </select>
  );
}
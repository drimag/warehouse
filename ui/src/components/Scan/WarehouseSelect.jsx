const warehouses = ["A", "B", "C"];

export default function WarehouseSelect({ warehouse, setWarehouse }) {
  return (
    <div className="scan-field">
      <label>Warehouse</label>
      <select
        value={warehouse}
        onChange={(e) => setWarehouse(e.target.value)}
      >
        <option value="">Select warehouse</option>
        {warehouses.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </div>
  );
}
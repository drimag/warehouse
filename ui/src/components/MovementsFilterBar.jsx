export default function MovementsFilterBar({
  searchVin,
  setSearchVin,
  from,
  setFrom,
  to,
  setTo,
  action,
  setAction,
}) {
  const warehouses = ["ALL", "Warehouse A", "Warehouse B"];
  const actions = ["ALL", "SEND", "RECEIVE", "MANUAL"];

  return (
    <div className="filter-bar">
      <input
        className="input"
        placeholder="VIN"
        value={searchVin}
        onChange={(e) => setSearchVin(e.target.value)}
      />

      <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
        {warehouses.map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select>

      <select className="select" value={to} onChange={(e) => setTo(e.target.value)}>
        {warehouses.map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select>

      <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
        {actions.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}
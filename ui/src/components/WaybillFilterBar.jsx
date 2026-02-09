export default function WaybillFilterBar({
  searchWaybill,
  setSearchWaybill,
  from,
  setFrom,
  to,
  setTo,
  action,
  setAction,
}) {
  const warehouses = ["WaybillA", "WaybillB"];
  const status = ["Active", "Processed"];
  const inOut = ["In", "Out"];

  return (
    <div className="filter-bar">
      <input
        className="input"
        placeholder="Waybill"
        value={searchWaybill}
        onChange={(e) => setSearchWaybill(e.target.value)}
      />

      <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
        {status.map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select>

      <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
        {inOut.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}
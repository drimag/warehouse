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
  const status = ["DRAFT", "ADVICE", "IN_TRANSIT", "ARRIVED", "CLOSED"];
  const inOut = ["In", "Out"];

  return (
    <div className="filter-bar">
      <input
        className="input"
        placeholder="Waybill"
        value={searchWaybill}
        onChange={(e) => setSearchWaybill(e.target.value)}
      />

      <input
        className="input"
        placeholder="Driver"
        value={searchWaybill}
        onChange={(e) => setSearchWaybill(e.target.value)}
      />

      <input
        className="input"
        placeholder="Client"
        value={searchWaybill}
        onChange={(e) => setSearchWaybill(e.target.value)}
      />

      <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
        {status.map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select>

    </div>
  );
}
import StatusBadge from "./StatusBadge";

export default function UnitRow({ unit, onClick }) {
  return (
    <tr className="table-row" onClick={onClick}>
      <td>{unit.vin}</td>
      <td>
        <StatusBadge status={unit.status} />
      </td>
      <td>{unit.currentWarehouse || "-"}</td>
    </tr>
  );
}

import UnitRow from "./UnitRow";

export default function UnitTable({ units, onRowClick }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>VIN</th>
          <th>Status</th>
          <th>Warehouse</th>
        </tr>
      </thead>

      <tbody>
        {units.map((u) => (
          <UnitRow
            key={u.vin}
            unit={u}
            onClick={() => onRowClick(u.vin)}
          />
        ))}

        {units.length === 0 && (
          <tr>
            <td colSpan="3" className="empty">
              No units found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
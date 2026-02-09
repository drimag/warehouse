import WaybillRow from "./WaybillRow";

export default function WaybillTable({ movements, onRowClick }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Waybill</th>
          <th>Driver</th>
          <th>Truck</th>
          <th>Time</th>
          <th>Status</th>
          <th>InOut</th>
          <th>Quantity</th>
          <th>Photo</th>
          <th>User</th>
        </tr>
      </thead>

      <tbody>
        {movements.map((m) => (
          <WaybillRow 
            key={m.id} 
            movement={m} 
            onClick={() => onRowClick(m.vin)}
          />
        ))}

        {movements.length === 0 && (
          <tr>
            <td colSpan="9" className="empty">
              No movements found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
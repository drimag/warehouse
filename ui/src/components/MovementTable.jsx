import MovementRow from "./MovementRow";

export default function MovementTable({ movements }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>VIN</th>
          <th>From</th>
          <th>To</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {movements.map((m) => (
          <MovementRow key={m.id} movement={m} />
        ))}

        {movements.length === 0 && (
          <tr>
            <td colSpan="5" className="empty">
              No movements found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
export default function MovementRow({ movement, onClick }) {
  return (
    <tr className="table-row" onClick={onClick}>
      <td>{movement.timestamp}</td>
      <td>{movement.vin}</td>
      <td>{movement.fromWarehouse}</td>
      <td>{movement.toWarehouse}</td>
      <td>{movement.action}</td>
    </tr>
  );
}
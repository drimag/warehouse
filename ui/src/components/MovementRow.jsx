export default function MovementRow({ movement }) {
  return (
    <tr className="table-row">
      <td>{movement.timestamp}</td>
      <td>{movement.vin}</td>
      <td>{movement.fromWarehouse}</td>
      <td>{movement.toWarehouse}</td>
      <td>{movement.action}</td>
    </tr>
  );
}
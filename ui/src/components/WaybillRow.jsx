export default function WaybillRow({ movement, onClick }) {
  return (
    <tr className="table-row" onClick={onClick}>
      <td>{movement.waybill}</td>
      <td>{movement.driver}</td>
      <td>{movement.truck}</td>
      <td>{movement.timestamp}</td>
      <td>{movement.status}</td>
      <td>{movement.inout}</td>
      <td>{movement.quantity}</td>
      <td>{movement.photoUrl}</td>
      <td>{movement.userEmail}</td>
    </tr>
  );
}
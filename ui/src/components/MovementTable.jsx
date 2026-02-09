import React from "react";

export default function MovementTable({ movements, onRowClick }) {
  return (
      <table className="table">
        <thead>
          <tr>
            <th>Time Scanned</th>
            <th>Movement ID</th>
            <th>Waybill</th>
            <th>VIN</th>
          </tr>
        </thead>
        <tbody>
          {movements.length > 0 ? (
            movements.map((m) => (
              <tr 
                key={m.movementId} 
                onClick={() => onRowClick(m.vin)}
                style={{ cursor: "pointer" }}
              >
                <td>{m.timeScanned}</td>
                <td className="mono-text">{m.movementId}</td>
                <td><strong>{m.waybill}</strong></td>
                <td className="mono-text">{m.vin}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                No movements found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
  );
}
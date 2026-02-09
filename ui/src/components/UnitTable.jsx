import React from "react";
import StatusBadge from "./StatusBadge";

export default function UnitTable({ units, onRowClick }) {
  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>VIN</th>
            <th>Engine</th>
            <th>Frame</th>
            <th>Model</th>
            <th>Color</th>
            <th>Status</th>
            <th>Warehouse</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.vin} onClick={() => onRowClick(u.vin)} className="empty">
              <td className="bold">{u.vin}</td>
              <td>{u.engine}</td>
              <td>{u.frame}</td>
              <td>{u.model}</td>
              <td>{u.color}</td>
              <td>
                <StatusBadge status={u.status} />
              </td>
              <td>{u.currentWarehouse || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
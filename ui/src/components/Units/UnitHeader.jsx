export default function UnitHeader({ unit }) {
  return (
    <div className="unit-header">
      {/* Primary Identifier */}
      <h1 className="page-title">Engine: {unit.engine}</h1>

      <div className="unit-meta">
        {/* Physical Specs */}
        <span>
          <strong>Frame:</strong> {unit.frame}
        </span>
        <span>
          <strong>Model:</strong> {unit.model}
        </span>
        <span>
          <strong>Color:</strong> {unit.color}
        </span>

        {/* Logistics Info */}
        <span>
          <strong>DA:</strong> {unit.da}
        </span>
        <span>
          <strong>Warehouse:</strong> {unit.current_warehouse}
        </span>

        {/* Status & Timing */}
        <span>
          <strong>Status:</strong> {unit.status}
        </span>

        <span>
          <strong>Last Update:</strong> {unit.last_updated}
        </span>
      </div>
    </div>
  );
}

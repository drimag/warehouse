export default function UnitHeader({ unit, vin }) {
  return (
    <div className="unit-header">
			<h1 className="page-title">{unit.vin}</h1>
			<div className="unit-meta">
        <span>Status: {unit.status}</span>
        <span>Location: {unit.location}</span>
        <span>Last update: {unit.lastUpdate}</span>
      </div>
    </div>
  );
}

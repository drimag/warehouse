import WarehouseFilter from "../Filters/WarehouseFilter";
import StatusFilter from "../Filters/StatusFilter";
import VinSearch from "../Filters/VinSearch";

export default function UnitFilters({
  warehouse,
  setWarehouse,
  status,
  setStatus,
  search,
  setSearch,
}) {
  return (
    <div className="filter-bar">
      <WarehouseFilter value={warehouse} onChange={setWarehouse} />
      <StatusFilter value={status} onChange={setStatus} />
      <VinSearch value={search} onChange={setSearch} />
    </div>
  );
}
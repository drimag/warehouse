import { useParams } from "react-router-dom";
import UnitHeader from "../components/UnitHeader";
import MovementTable from "../components/WaybillTable";

const mockUnit = {
  vin: "VIN123456",
  status: "IN_STORAGE",
  location: "Warehouse A",
  lastUpdate: "2026-01-25 14:32",
};

const mockMovements = [
  {
    id: 1,
    vin: "VIN123456",
    fromWarehouse: "Warehouse A",
    toWarehouse: "Warehouse B",
    action: "STORED",
    timestamp: "2026-01-22 10:21",
  },
  {
    id: 2,
    vin: "VIN123456",
    fromWarehouse: "Warehouse B",
    toWarehouse: "Warehouse C",
    action: "IN_TRANSIT",
    timestamp: "2026-01-22 14:05",
  },
  {
    id: 3,
    vin: "VIN123456",
    fromWarehouse: "Warehouse B",
    toWarehouse: "Warehouse A",
    action: "STORED",
    timestamp: "2026-01-23 09:12",
  },
];

export default function UnitPage() {
  const { vin } = useParams(); // later: fetch by this

  return (
    <div className="page">
      <UnitHeader unit={{ ...mockUnit}}/>
      <MovementTable movements={mockMovements} />
    </div>
  );
}
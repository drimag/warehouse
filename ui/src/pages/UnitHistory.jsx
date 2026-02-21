import { useParams } from "react-router-dom";
import UnitHeader from "../components/UnitHeader";
import MovementTable from "../components/MovementTable";

const mockUnit = {
  vin: "VIN123456",
  status: "IN_STORAGE",
  location: "Warehouse A",
  lastUpdate: "2026-01-25 14:32",
};

const mockMovements = [
  {
    movementId: "MOV-1001",
    timeScanned: "2026-01-22 10:21:05",
    waybill: "WB-8821",
    vin: "1HGCM82635A001",
  },
  {
    movementId: "MOV-1002",
    timeScanned: "2026-01-22 10:22:14",
    waybill: "WB-8821",
    vin: "1HGCM82635A002",
  },
  {
    movementId: "MOV-1003",
    timeScanned: "2026-01-22 14:05:33",
    waybill: "WB-9940",
    vin: "JTDZN3EU4F1009",
  }
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
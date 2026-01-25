import { useState } from "react";
import ScanInput from "../components/Scan/ScanInput";
import ActionSelector from "../components/Scan/ActionSelector";
import WarehouseSelect from "../components/Scan/WarehouseSelect";
import ScanResult from "../components/Scan/ScanResult";
import "../styles/scan.css";

export default function Scan() {
  const [vin, setVin] = useState("");
  const [action, setAction] = useState("receive");
  const [warehouse, setWarehouse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!vin || !warehouse) return;
    setSubmitted(true);
  };

  return (
    <div className="scan-page">
      <h1>Scan Unit</h1>

      <ScanInput vin={vin} setVin={setVin} />
      <ActionSelector action={action} setAction={setAction} />
      <WarehouseSelect warehouse={warehouse} setWarehouse={setWarehouse} />

      <button className="primary-btn" onClick={handleSubmit}>
        Confirm
      </button>

      {submitted && (
        <ScanResult vin={vin} action={action} warehouse={warehouse} />
      )}
    </div>
  );
}
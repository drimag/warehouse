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
  const [warehouse2, setWarehouse2] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!vin || !warehouse) return;
    setSubmitted(true);
  };

  return (
    <div className="page-centered page">
      <h1 className="page-title">Scan Unit</h1>

      <ScanInput vin={vin} setVin={setVin} />
      <ActionSelector action={action} setAction={setAction} />
      <div className="warehouse-row">
        <WarehouseSelect warehouse={warehouse} setWarehouse={setWarehouse} title="Origin"/>
        <WarehouseSelect warehouse={warehouse2} setWarehouse={setWarehouse2} title="Destination"/>
      </div>

      <button className="primary-btn" onClick={handleSubmit}>
        Confirm
      </button>

      {submitted && (
        <ScanResult vin={vin} action={action} warehouse1={warehouse} warehouse2={warehouse2}/>
      )}
    </div>
    
  );
}
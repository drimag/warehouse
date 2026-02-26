import { useState } from "react";
import UnitUpload from "../components/Units/UnitUpload";
import GenericInput from "../components/GenericInput";
import GenericSelect from "../components/Scan/GenericSelect";
import UnitConfirm from "../components/Units/UnitConfirm";

export default function UnitForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState("Warehouse A");
  const [currentStatus, setCurrentStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const warehouseList = ["N/A", "Warehouse A", "Warehouse B", "Warehouse C"];
  const statusList = ["IN_TRANSIT", "IN_STORAGE", "CLOSED"];

  const mockUnit = {
    engine: "ENG-2026-X",
    frame: "FRM-9900",
    model: "Toyota Hilux",
    color: "Nebula Blue",
    da: "DA-1002",
    current_warehouse: "Manila Port",
    status: "IN STOCK",
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleConfirm = () => {
    setSubmitted(false);
  };

  const handleUpload = (file) => {
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON (This matches your table data!)
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Parsed Data:", jsonData);
      setIsProcessing(false);
      alert(`${jsonData.length} rows found! Check console.`);
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="page-centered page">
      {!submitted ? (
        <>
          <h1 className="page-title">Insert Units</h1>
          <UnitUpload onFileSelect={handleUpload} isLoading={isProcessing} />

          <hr className="divider" />

          <h1 className="page-title">Manual Insert</h1>
          <GenericInput title="Engine" placeholder="Enter Engine Code" />
          <GenericInput title="Frame" placeholder="Enter Frame Code" />
          <GenericInput title="Model" placeholder="Enter Model Code" />
          <GenericInput title="Color" placeholder="Enter Color" />
          <GenericSelect
            selected={currentWarehouse}
            setSelected={(val) => {
              setCurrentWarehouse(val);
            }}
            title={"Current Warehouse"}
            options={warehouseList}
            placeholder={"Select Current Warehouse"}
          />
          <GenericSelect
            selected={currentStatus}
            setSelected={(val) => {
              setCurrentStatus(val);
            }}
            title={"Current Status"}
            options={statusList}
            placeholder={"Select Current Status"}
          />
          <button className="primary-btn" onClick={handleSubmit}>
            Insert Unit/s
          </button>
        </>
      ) : (
        <>
          <UnitConfirm
            unit={mockUnit}
            onCancel={handleConfirm}
            onConfirm={handleConfirm}
          />
        </>
      )}
    </div>
  );
}

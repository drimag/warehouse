import { useState } from "react";
import ScanInput from "../components/Scan/ScanInput";
import WarehouseSelect from "../components/Scan/WarehouseSelect";
import PhotoUpload from "../components/Scan/PhotoUpload";
import ScanResult from "../components/Scan/ScanResult";
import "../styles/scan.css";
import WaybillResult from "../components/Scan/WaybillResult";

export default function StockIn() {
  const [waybill, setWaybill] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleSubmit = () => {
    if (!waybill || !warehouse) return;
    setSubmitted(true);
  };

  return (
    <div className="page-centered page">
      <h1 className="page-title">Stock In</h1>

      <ScanInput vin={waybill} setVin={setWaybill} title={"Scan"} />
      <WarehouseSelect
        warehouse={warehouse}
        setWarehouse={setWarehouse}
        title="Warehouse"
      />
      <PhotoUpload title={"Photo"} preview={preview} setPreview={setPreview}/>

      <button className="primary-btn" onClick={handleSubmit}>
        Confirm
      </button>

      {submitted && (
        <WaybillResult
          waybill={waybill}
          driver={"DriverName"}
          truck={"TruckID"}
          time={"currenttime"}
          status={"Active"}
          origin={"Warehouse"}
          destination={warehouse}
          inout={"Incoming"}
          photo={preview}
        />
      )}
    </div>
  );
}

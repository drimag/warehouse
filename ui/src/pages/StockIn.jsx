import { useState, useRef } from "react";
import ScanInput from "../components/Scan/ScanInput";
import WarehouseSelect from "../components/Scan/WarehouseSelect";
import PhotoUpload from "../components/Scan/PhotoUpload";
import GenericSelect from "../components/Scan/GenericSelect";
import ScanResult from "../components/Scan/ScanResult";
import "../styles/scan.css";
import WaybillResult from "../components/Scan/WaybillResult";

export default function StockIn() {
  const [waybill, setWaybill] = useState("");
  const [destination, setDestination] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(null);

  const warehouseList = ["Warehouse A", "Warehouse B", "Warehouse C"];

  const destRef = useRef(null);
  const photoRef = useRef(null);

  const handleSubmit = () => {
    if (!waybill || !warehouse) return;
    setSubmitted(true);
  };

  const focusNext = (nextRef) => {
    const element = nextRef.current;
    if (!element) return;
    element.focus();

    if (element.tagName === "SELECT" && "showPicker" in element) {
      try {
        element.showPicker();
      } catch (err) {
        console.warn("Auto-picker blocked or unsupported:", err);
      }
    } else if (element.tagName === "INPUT" && element.type === "file") {
      element.click();
    }
  };

  return (
    <div className="page-centered page">
      <h1 className="page-title">Stock In</h1>

      <ScanInput
        vin={waybill}
        setVin={setWaybill}
        title={"New Waybill"}
        onKeyDown={(e) => e.key === "Enter" && focusNext(destRef)}
      />
      <GenericSelect
        ref={destRef}
        selected={destination}
        setSelected={(val) => {
          setDestination(val);
          focusNext(photoRef);
        }}
        title={"Origin"}
        options={warehouseList}
      />
      <PhotoUpload
        ref={photoRef}
        title={"Photo"}
        preview={preview}
        setPreview={setPreview}
      />

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

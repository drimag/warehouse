import { useState } from "react";
import ScanInput from "../components/Scan/ScanInput";
import WarehouseSelect from "../components/Scan/WarehouseSelect";
import PhotoUpload from "../components/Scan/PhotoUpload";
import ScanResult from "../components/Scan/ScanResult";
import GenericSelect from "../components/Scan/GenericSelect";
import "../styles/scan.css";
import WaybillResult from "../components/Scan/WaybillResult";

export default function StockOut() {
  const [waybill, setWaybill] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [warehouse2, setWarehouse2] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(null);
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");
  const [quantity, setQuantity] = useState(0);

  const driverList = ["Driver A", "Driver B", "Driver C"]
  const truckList = ["Truck A", "Truck B", "Truck C"]
  const handleSubmit = () => {
    if (!waybill || !warehouse) return;
    setSubmitted(true);
  };

  return (
    <div className="page-centered page">
      <h1 className="page-title">Stock Out</h1>

      <ScanInput vin={waybill} setVin={setWaybill} title={"New Waybill"} />
      <div className="warehouse-row">
        <WarehouseSelect warehouse={warehouse} setWarehouse={setWarehouse} title="Origin"/>
        <WarehouseSelect warehouse={warehouse2} setWarehouse={setWarehouse2} title="Destination"/>
      </div>
      <GenericSelect selected={driver} setSelected={setDriver} title={"Driver"} options={driverList} placeholder={"Select Driver"}/>
      <GenericSelect selected={truck} setSelected={setTruck} title={"Truck"} options={truckList} placeholder={"Select Truck"}/>
      <ScanInput vin={quantity} setVin={setQuantity} title="Quantity" />
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

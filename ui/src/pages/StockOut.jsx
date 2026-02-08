import { useState, useRef } from "react";
import ScanInput from "../components/Scan/ScanInput";
import PhotoUpload from "../components/Scan/PhotoUpload";
import ScanResult from "../components/Scan/ScanResult";
import GenericSelect from "../components/Scan/GenericSelect";
import "../styles/scan.css";
import WaybillResult from "../components/Scan/WaybillResult";
import Scan from "./Scan";

export default function StockOut() {
  const wayscanRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);
  const driverRef = useRef(null);
  const truckRef = useRef(null);
  const qtyRef = useRef(null);
  const photoRef = useRef(null);

  const [waybillname, setWaybillName] = useState("");
  const [waybillcode, setWaybillCode] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(null);
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");
  const [quantity, setQuantity] = useState(0);

  const driverList = ["Driver A", "Driver B", "Driver C"];
  const truckList = ["Truck A", "Truck B", "Truck C"];
  const warehouseList = ["Warehouse A", "Warehouse B", "Warehouse C"];

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
      <h1 className="page-title">Stock Out</h1>

      <ScanInput
        vin={waybillname}
        setVin={setWaybillName}
        title={"Name Waybill"}
        onKeyDown={(e) => e.key === "Enter" && focusNext(wayscanRef)}
        placeholder={"Name New Waybill"}
      />

      <ScanInput
        ref={wayscanRef}
        vin={waybillcode}
        setVin={setWaybillCode}
        title={"Scan Waybill"}
        onKeyDown={(e) => e.key === "Enter" && focusNext(originRef)}
        placeholder={"Scan New Waybill"}
      />

      <div className="warehouse-row">
        <GenericSelect
          ref={originRef}
          selected={origin}
          setSelected={(val) => {
            setOrigin(val);
            focusNext(destRef);
          }}
          title={"Origin"}
          options={warehouseList}
          placeholder={"Select Warehouse"}
        />

        <GenericSelect
          ref={destRef}
          selected={destination}
          setSelected={(val) => {
            setDestination(val);
            focusNext(driverRef);
          }}
          title={"Destination"}
          options={warehouseList}
          placeholder={"Select Warehouse"}
        />
      </div>

      <GenericSelect
        ref={driverRef}
        selected={driver}
        setSelected={(val) => {
          setDriver(val);
          focusNext(truckRef);
        }}
        title={"Driver"}
        options={driverList}
        placeholder={"Select Driver"}
      />
      <GenericSelect
        ref={truckRef}
        selected={truck}
        setSelected={(val) => {
          setTruck(val);
          focusNext(qtyRef);
        }}
        title={"Truck"}
        options={truckList}
        placeholder={"Select Truck"}
      />

      <ScanInput
        ref={qtyRef}
        vin={quantity}
        setVin={setQuantity}
        title="Quantity"
        onKeyDown={(e) => e.key === "Enter" && focusNext(photoRef)}
        placeholder={"Enter Quantity"}
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

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScanInput from "../components/Scan/ScanInput";
import PhotoUpload from "../components/Scan/PhotoUpload";
import GenericSelect from "../components/Scan/GenericSelect";
import "../styles/scan.css";
import WaybillConfirm from "../components/WaybillConfirm";

export default function Waybill() {
  const navigate = useNavigate();

  const wayscanRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);
  const driverRef = useRef(null);
  const truckRef = useRef(null);
  const qtyRef = useRef(null);
  const photoRef = useRef(null);

  const [selection, setSelection] = useState("DEPARTURE");
  const [waybillname, setWaybillName] = useState("");
  const [origin, setOrigin] = useState("Warehouse A");
  const [destination, setDestination] = useState("Warehouse B");
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(null);
  const [driver, setDriver] = useState("Driver A");
  const [truck, setTruck] = useState("Truck A");
  const [quantity, setQuantity] = useState(5);
  const [showAdvice, setShowAdvice] = useState(false);
  const [scan1, setScan1] = useState("");
  const [scan2, setScan2] = useState("");

  const driverList = ["Driver A", "Driver B", "Driver C"];
  const truckList = ["Truck A", "Truck B", "Truck C"];
  const warehouseList = ["Warehouse A", "Warehouse B", "Warehouse C"];
  const waybillList = ["Waybill A", "Waybill B", "Waybill C"];
  const waybillType = ["DEPARTURE", "ARRIVAL"];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleAdvice = () => {
    setShowAdvice(true);
  };

  const handleEnd = () => {
    setSubmitted(false);
    setShowAdvice(false);
  };

  const handleNext = () => {
    setEngine("");
    setFrame("");
    setModel("");
    setColor("");
  };

  const emptyFunc = () => {};

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
      {!submitted ? (
        <>
          <h1 className="page-title"> Waybills </h1>

          <ScanInput
            vin={waybillname}
            setVin={setWaybillName}
            title={"Waybill Name"}
            placeholder={"Enter Waybill Name"}
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
          <button className="primary-btn" onClick={handleSubmit}>
            Create New Waybill
          </button>

          <hr className="divider" />
          <h1 className="page-title"> Advice </h1>
          <div>
            <GenericSelect
              ref={driverRef}
              selected={driver}
              setSelected={(val) => {
                setDriver(val);
                focusNext(truckRef);
              }}
              title={"Type"}
              options={waybillType}
              placeholder={"Select Waybill Type"}
            />
            <ScanInput
              title={"Expected Time"}
              placeholder={"Enter Expected Time"}
            />

            <ScanInput
              vin={quantity}
              setVin={setQuantity}
              title={"Expected Quantity"}
              placeholder={"Enter Expected Quantity"}
            />
          </div>

          <button className="primary-btn" onClick={handleSubmit}>
            Create Waybill with Advice
          </button>
        </>
      ) : (
        <>
          <WaybillConfirm
            waybill={waybillname}
            status={"Departure"}
            origin={"Warehouse A"}
            destination={"Warehouse B"}
            user={"user-01"}
            handleSubmit={handleEnd}
          />
        </>
      )}
    </div>
  );
}

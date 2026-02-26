import { useState, useRef } from "react";
import ScanInput from "../components/Scan/ScanInput";
import PhotoUpload from "../components/Scan/PhotoUpload";
import GenericSelect from "../components/Scan/GenericSelect";
import "../styles/scan.css";
import WaybillResult from "../components/Scan/WaybillResult";

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
  const [showModal, setShowModal] = useState(false);
  const [scan1, setScan1] = useState("");
  const [scan2, setScan2] = useState("");

  const driverList = ["Driver A", "Driver B", "Driver C"];
  const truckList = ["Truck A", "Truck B", "Truck C"];
  const warehouseList = ["Warehouse A", "Warehouse B", "Warehouse C"];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleConfirm = () => {
    setShowModal(true);
  };

  const handleEnd = () => {
    setShowModal(false);
    setSubmitted(false);
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
            title="Expected Quantity"
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
            Proceed
          </button>
        </>
      ) : (
        <>
          <WaybillResult
            waybill={waybillname}
            driver={"DriverName"}
            truck={"TruckID"}
            time={"currenttime"}
            status={"Active"}
            origin={"Warehouse"}
            destination={"Destination"}
            inout={"Incoming"}
            photo={preview}
            handleSubmit={handleConfirm}
          />
        </>
      )}

      {/* The Popout Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1 className="page-title">Scan Next Unit</h1>
            <ScanInput
              vin={scan1}
              setVin={setScan1}
              title={"Scan"}
              placeholder={"Scan Unit"}
            />
            <ScanInput
              vin={scan2}
              setVin={setScan2}
              title={"ReScan"}
              placeholder={"ReScan"}
            />
            <h3 className="scan-counter">1/5</h3>
            <div className="warehouse-row">
              <button className="primary-btn" onClick={handleNext}>
                Next Unit
              </button>
              <button className="primary-btn" onClick={handleEnd}>
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

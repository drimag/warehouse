import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScanInput from "../components/Scan/ScanInput";
import GenericSelect from "../components/Scan/GenericSelect";
import WaybillConfirm from "../components/Waybills/WaybillConfirm";
import SearchableSelect from "../components/SearchableSelect";
import DatePicker from "../components/Scan/DatePicker";

import "../styles/scan.css";

export default function WaybillForm() {
  const navigate = useNavigate();

  const getLocalISOString = () => {
    const now = new Date();
    // Adjust for the user's local timezone offset
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now - offset);

    // Returns "YYYY-MM-DDTHH:MM" (exactly what the input needs)
    return localTime.toISOString().slice(0, 16);
  };

  const [waybillname, setWaybillName] = useState("");
  const [origin, setOrigin] = useState("Warehouse A");
  const [destination, setDestination] = useState("Warehouse B");
  const [submitted, setSubmitted] = useState(false);
  const [driver, setDriver] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [expectedDate, setExpectedDate] = useState(getLocalISOString());

  const warehouseList = ["Warehouse A", "Warehouse B", "Warehouse C"];
  const mockWaybillList = ["waybill A", "second waybill", "pangatlong waybill"];
  const waybillType = ["DEPARTURE", "ARRIVAL"];

  const handleSubmit = () => {
    setSubmitted(true);
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
              // ref={}
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
              // ref={destRef}
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
            <SearchableSelect
              selected={driver}
              setSelected={(val) => {
                setDriver(val);
                focusNext(truckRef);
              }}
              title={"Type"}
              options={waybillType}
              placeholder={"Select Waybill Type"}
            />

            <DatePicker
              selected={expectedDate}
              setSelected={(val) => {
                setExpectedDate(val);
                focusNext(truckRef);
              }}
              title={"Expected Date"}
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

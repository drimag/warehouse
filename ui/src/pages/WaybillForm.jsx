import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScanInput from "../components/Scan/ScanInput";
import GenericSelect from "../components/Scan/GenericSelect";
import WaybillConfirm from "../components/Waybills/WaybillConfirm";
import SearchableSelect from "../components/SearchableSelect";
import DatePicker from "../components/Scan/DatePicker";

import "../styles/scan.css";

import { api } from "../services/api";
import { getLocalISOString } from "../utils/dateUtils";
import GenericInput from "../components/GenericInput";

export default function WaybillForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [withAdvice, setWithAdvice] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waybillError, setWaybillError] = useState("");
  const [adviceError, setAdviceError] = useState("");

  const [waybill, setWaybill] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");

  const [advice, setAdvice] = useState(null);
  const [expectedQty, setExpectedQty] = useState(0);
  const [expectedDate, setExpectedDate] = useState("");
  const [client, setClient] = useState("");

  const originRef = useRef(null);
  const destRef = useRef(null);
  const driverRef = useRef(null);
  const truckRef = useRef(null);

  const [locationList, setLocationsList] = useState([]);
  const [truckList, setTruckList] = useState([]);
  const [driverList, setDriverList] = useState([]);

  const [truckData, setTruckData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);

        const [trucks, drivers, locations] = await Promise.all([
          api.getTrucks(),
          api.getDrivers(),
          api.getLocations(),
        ]);

        setTruckData(trucks);
        setDriverData(drivers);
        setLocationData(locations);

        const truckList = trucks.map((item) => item.plate_number);
        const driverList = drivers.map((item) => item.full_name);
        const locationList = locations.map((item) => item.name);

        setTruckList(truckList);
        setDriverList(driverList);
        setLocationsList(locationList);
      } catch (err) {
        console.error(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const handleConfirmWaybill = () => {
    setWaybillError("");
    setAdviceError("");
    if (!origin.trim() || !destination.trim() || !client.trim()) {
      setWaybillError(
        "Origin, Destination, and Client are required to save the Waybill.",
      );
      return;
    }
    setSubmitted(true);
    setWithAdvice(false);
  };

  const handleConfirmAdvice = () => {
    setWaybillError("");
    setAdviceError("");
    if (!origin.trim() || !destination.trim() || !client.trim() || !expectedDate.trim() || expectedQty===0) {
      setAdviceError(
        "Origin, Destination, Client, and Advice Details are required.",
      );
      return;
    }
    setSubmitted(true);
    setWithAdvice(true);
  };

  const handleSubmit = async () => {
    try {
      const selectedOrig = locationData.find((item) => item.name === origin);
      const selectedDest = locationData.find(
        (item) => item.name === destination,
      );
      const selectedTruck = truckData?.find(
        (item) => item.plate_number === truck,
      );
      const selectedDriver = driverData?.find(
        (item) => item.full_name === driver,
      );

      const details = {
        origin_id: selectedOrig?.id,
        destination_id: selectedDest?.id,
        client: client,
        driver_id: selectedDriver?.id,
        truck_id: selectedTruck?.id,
      };

      const response = await api.saveWaybillForm(details);
      setWaybill(response);

      //TODO insert into advice with the same shit
      return response;
    } catch (err) {
      console.error("Save failed:", err);
      setWaybillError("Failed to save Waybill. Please check your connection.");
    }
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

    // Highlight text for standard inputs
    if (
      element.tagName === "INPUT" &&
      ["text", "number", "tel"].includes(element.type)
    ) {
      element.select();
    }

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

  const handleGenericEnter = (e, nextRef, currentValue) => {
    if (e.key === "Enter" && currentValue && currentValue.trim() !== "") {
      focusNext(nextRef);
    }
  };

  if (loading) return <div>Loading</div>;

  return (
    <div className="page-centered page">
      {!submitted ? (
        <>
          <h1 className="page-title"> Waybills </h1>

          <GenericInput
            val={client}
            setVal={setClient}
            title={"Client"}
            onKeyDown={(e) => handleGenericEnter(e, originRef, client)}
            placeholder={"Enter Client"}
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
              options={locationList}
              placeholder={"Select Origin"}
            />

            <GenericSelect
              ref={destRef}
              selected={destination}
              setSelected={(val) => {
                setDestination(val);
                focusNext(driverRef);
              }}
              title={"Destination"}
              options={locationList}
              placeholder={"Select Destination"}
            />
          </div>

          <div className="warehouse-row">
            <GenericSelect
              ref={driverRef}
              selected={driver}
              setSelected={(val) => {
                setDriver(val);
                focusNext(truckRef);
              }}
              title={"Driver"}
              options={driverList}
              placeholder={"Assign Driver"}
            />

            <GenericSelect
              ref={truckRef}
              selected={truck}
              setSelected={setTruck}
              title={"Truck"}
              options={truckList}
              placeholder={"Assign Truck"}
            />
          </div>

          <button className="primary-btn" onClick={handleConfirmWaybill}>
            Create New Waybill
          </button>

          {waybillError && (
            <div
              style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}
            >
              ⚠️ {waybillError}
            </div>
          )}

          <hr className="divider" />
          <h1 className="page-title"> Advice </h1>
          <div>
            {/* <SearchableSelect
              selected={driver}
              setSelected={(val) => {
                setDriver(val);
                focusNext(truckRef);
              }}
              title={"Type"}
              options={waybillType}
              placeholder={"Select Waybill Type"}
            /> */}

            <DatePicker
              selected={expectedDate}
              setSelected={(val) => {
                setExpectedDate(val);
                focusNext(truckRef);
              }}
              title={"Expected Date of Arrival"}
            />

            <ScanInput
              vin={expectedQty}
              setVin={setExpectedQty}
              title={"Expected Quantity"}
              placeholder={"Enter Expected Quantity"}
            />
          </div>

          <button className="primary-btn" onClick={handleConfirmAdvice}>
            Create Waybill with Advice
          </button>

          {adviceError && (
            <div
              style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}
            >
              ⚠️ {adviceError}
            </div>
          )}
        </>
      ) : (
        <>
          <WaybillConfirm
            waybill={waybill}
            handleSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}

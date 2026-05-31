import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [waybill, setWaybill] = useState(null);
  const [wbCode, setWBCode] = useState("");
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");
  const [expectedQty, setExpectedQty] = useState(0);
  const [expectedDate, setExpectedDate] = useState("");
  const [client, setClient] = useState("");

  const statusRef = useRef(null);
  const clientRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);
  const driverRef = useRef(null);
  const truckRef = useRef(null);

  const statusList = ["ADVICE", "IN_TRANSIT"];
  const [locationList, setLocationsList] = useState([]);
  const [truckList, setTruckList] = useState([]);
  const [driverList, setDriverList] = useState([]);

  const [truckData, setTruckData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {
    const fetchPageData = async () => {
      if (authLoading) return;
      if (!user) return;

      try {
        setLoading(true);
        setNetworkError(null);

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
        setNetworkError("Failed to load logistics form data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [user, authLoading]);

  const resetDetails = () => {
    setWaybill(null);
    setStatus("");
    setOrigin("");
    setDestination("");
    setDriver("");
    setTruck("");
    setExpectedQty(0);
    setExpectedDate("");
    setClient("");
  };

  const handleCancelSubmit = () => {
    resetPage();
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
        code: wbCode,
        status: status,
        origin_id: selectedOrig?.id,
        destination_id: selectedDest?.id,
        client: client,
        driver_id: selectedDriver?.id,
        truck_id: selectedTruck?.id,
        expected_quantity: status === "ADVICE" ? expectedQty || null : null,
        expected_arrival: status === "ADVICE" ? expectedDate || null : null,
      };

      const response = await api.saveWaybillForm(details);
      console.log("response: ", response);

      const displayDetails = {
        id: response.id,
        origin: origin,
        destination: destination,
        truck: truck,
        driver: driver,
        client: client,
        expectedQty: expectedQty,
        expectedDate: expectedDate,
      };
      setWaybill(displayDetails);
      console.log("display details: ", displayDetails);
      console.log("waybill withinhandlesubmit: ", waybill);
      setSubmitted(true);
      return response;
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save Waybill. Please check your connection.");
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

  //TODO: put this into a common file
  const focusNext = (nextRef) => {
    const element = nextRef.current;
    if (!element) return;
    element.focus();

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

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;

  return (
    <div className="page-centered page">
      {!submitted ? (
        <>
          <h1 className="page-title"> Waybills </h1>

          <GenericInput
            val={wbCode}
            setVal={setWBCode}
            title={"WB Code"}
            onKeyDown={(e) => handleGenericEnter(e, statusRef, wbCode)}
            placeholder={"Enter Waybill Code"}
          />

          <GenericSelect
            ref={statusRef}
            selected={status}
            setSelected={(val) => {
              setStatus(val);
              focusNext(clientRef);
            }}
            title={"WB Status"}
            options={statusList}
            placeholder={"Choose WB Type"}
          />

          <GenericInput
            ref={clientRef}
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

          {status === "ADVICE" && (
            <div>
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
          )}

          {error && (
            <div
              style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}
            >
              ⚠️ {error}
            </div>
          )}

          <button className="primary-btn" onClick={handleSubmit}>
            Create New Waybill
          </button>
        </>
      ) : (
        <>
          {waybill ? (
            <WaybillConfirm waybill={waybill} setSubmitted={setSubmitted} />
          ) : (
            <div>Loading waybill details...</div>
          )}
        </>
      )}
    </div>
  );
}

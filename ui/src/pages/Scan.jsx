import { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import ScanInput from "../components/Scan/ScanInput";
import PhotoUpload from "../components/Scan/PhotoUpload";
import GenericSelect from "../components/Scan/GenericSelect";
import "../styles/scan.css";
import WaybillResult from "../components/Scan/WaybillResult";
import { useScan } from "../utils/useScan";

export default function Scan() {
  const navigate = useNavigate();

  const {
    selectedWaybill,
    waybillID,
    confirmedScans,
    scan1,
    setScan1,
    scan2,
    setScan2,
    showRescan,
    showModal,
    error,
    submitted,
    handleWaybillSelect,
    startScan,
    handleNext,
    handleFinish,
    handleEnd,
    handleCancel,
  } = useScan();

  const originRef = useRef(null);
  const destRef = useRef(null);
  const driverRef = useRef(null);
  const truckRef = useRef(null);
  const qtyRef = useRef(null);
  const photoRef = useRef(null);

  const [origin, setOrigin] = useState("Warehouse A");
  const [destination, setDestination] = useState("Warehouse B");
  const [preview, setPreview] = useState(null);
  const [driver, setDriver] = useState("Driver A");
  const [truck, setTruck] = useState("Truck A");
  const [quantity, setQuantity] = useState(5);

  const [driverList, setDriverList] = useState("");
  const [truckList, setTruckList] = useState("");
  const [locationsList, setLocationsList] = useState("");

  const [waybillList, setWaybillList] = useState("");
  const [validWaybills, setValidWaybills] = useState("");

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);

        const [waybillData, truckData, driverData, locationData] =
          await Promise.all([
            api.getWaybillsForScan(),
            api.getTrucks(),
            api.getDrivers(),
            api.getLocations(),
          ]);

        const idList = waybillData.map((item) => item.id);
        const truckList = truckData.map((item) => item.plate_number);
        const driverList = driverData.map((item) => item.full_name);
        const locationList = locationData.map((item) => item.name);

        setValidWaybills(waybillData);
        setWaybillList(idList);
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

  if (loading) return <div>Loading Page...</div>;
  return (
    <div className="page-centered page">
      {!submitted ? (
        <>
          <h1 className="page-title"> Stock In / Stock Out </h1>

          <GenericSelect
            ref={originRef}
            selected={waybillID}
            setSelected={(val) => {
              handleWaybillSelect(val, validWaybills);
              focusNext(destRef);
            }}
            title={"Select Waybill"}
            options={waybillList}
            placeholder={"Select Waybill"}
          />
          <div className="scan-field">
            <label>No Waybill?</label>
            <button
              type="button"
              className="toggle-btn active scan-field"
              onClick={() => navigate("/waybill_form")}
            >
              Generate New Waybill
            </button>
          </div>

          {waybillID && (
            <div>
              <GenericSelect
                ref={driverRef}
                selected={selectedWaybill.driver}
                setSelected={(val) => {
                  console.log(selectedWaybill.driver);
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

              <PhotoUpload
                ref={photoRef}
                title={"Photo"}
                preview={preview}
                setPreview={setPreview}
              />
              <button className="primary-btn" onClick={startScan}>
                Proceed to Scanning
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <WaybillResult
            waybill={selectedWaybill.id}
            driver={"DriverName"}
            truck={"TruckID"}
            time={"currenttime"}
            status={"Active"}
            origin={"Warehouse"}
            destination={"Destination"}
            quantity={confirmedScans.length}
            photo={preview}
          />
          <button className="primary-btn" onClick={handleEnd}>
            Confirm
          </button>
          <button className="primary-btn cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </>
      )}

      {/* The Popout Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1 className="page-title">Scan Next Unit</h1>

            {error && (
              <p className="error-text" style={{ color: "red" }}>
                {error}
              </p>
            )}

            <ScanInput
              vin={scan1}
              setVin={setScan1}
              title={"Scan"}
              placeholder={"Scan Unit"}
            />

            {showRescan && (
              <ScanInput
                vin={scan2}
                setVin={setScan2}
                title={"ReScan"}
                placeholder={"ReScan to Confirm"}
              />
            )}

            <h3 className="scan-counter">
              {" "}
              {confirmedScans.length}{" "}
              {selectedWaybill?.expected_quantity &&
                ` / ${selectedWaybill.expected_quantity}`}{" "}
            </h3>

            <div className="warehouse-row">
              <button
                className="primary-btn"
                onClick={handleNext}
                disabled={!scan1.trim()}
              >
                Next Unit
              </button>
              <button className="primary-btn cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleFinish}
                disabled={confirmedScans.length === 0}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

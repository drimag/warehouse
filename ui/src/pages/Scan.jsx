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
    setSelectedWaybill,
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

  const [preview, setPreview] = useState(null);

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
        // const truckList = truckData.map((item) => item.plate_number);
        // const driverList = driverData.map((item) => item.full_name);
        // const locationList = locationData.map((item) => item.name);

        setValidWaybills(waybillData);
        setWaybillList(idList);
        // setTruckList(truckList);
        // setDriverList(driverList);
        // setLocationsList(locationList);
      } catch (err) {
        console.error(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  useEffect(() => {
    if (!waybillID) return;

    setLoading(true);
    api
      .getWaybillInfoById(waybillID)
      .then((data) => {
        setSelectedWaybill(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [waybillID]);

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

          {selectedWaybill && (
            <div>
              <p>Waybill ID: {selectedWaybill.id}</p>
              <p>
                Driver:{" "}
                {selectedWaybill.driver
                  ? selectedWaybill.driver
                  : "Unknown Driver"}
              </p>
              <p>
                Truck:{" "}
                {selectedWaybill.truck
                  ? selectedWaybill.truck
                  : "Unknown Truck"}
              </p>
              <p>Origin: {selectedWaybill.origin}</p>
              <p style={{ paddingBottom: '1rem' }}>Destination: {selectedWaybill.destination}</p>
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
          {selectedWaybill && (
            <WaybillResult
              waybill={selectedWaybill}
              quantity={confirmedScans.length}
              photo={preview}
            />
          )}
          <strong>Scanned Values:</strong>
          {confirmedScans.map((scan, index) => (
            <div key={index}>
              {scan.value} {scan.isNew ? "(New)" : ""}
            </div>
          ))}
          <div style={{ display: "flex", gap: "2rem" }}>
            <button className="primary-btn" onClick={handleEnd}>
              Confirm
            </button>
            <button className="primary-btn cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* The Popout Overlay */}
      {showModal && selectedWaybill && (
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
              {selectedWaybill?.expected_qty &&
                ` / ${selectedWaybill.expected_qty}`}{" "}
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

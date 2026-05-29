import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UnitUpload from "../components/Units/UnitUpload";
import GenericInput from "../components/GenericInput";
import GenericSelect from "../components/Scan/GenericSelect";
import UnitConfirm from "../components/Units/UnitConfirm";

import { api } from "../services/api";

export default function UnitForm() {
  const [engine, setEngine] = useState("");
  const [frame, setFrame] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [lastLocation, setLastLocation] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  const [unit, setUnit] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [locationsList, setLocationsList] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const statusList = ["IN_TRANSIT", "IN_STORAGE", "CLOSED"];

  const frameRef = useRef(null);
  const modelRef = useRef(null);
  const colorRef = useRef(null);
  const statusRef = useRef(null);
  const locationRef = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => {
    const fetchPageData = async () => {
      if (authLoading) return;
      if (!user) return;
      try {
        setLoading(true);
        setNetworkError(null);
        const locations = await api.getLocations();
        setLocationData(locations);
        const locationList = locations.map((item) => item.name);
        setLocationsList(locationList);
      } catch (err) {
        console.error(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [user, authLoading]);

  const handleSubmit = async () => {
    try {
      const selectedLocation = locationData.find(
        (item) => item.name === lastLocation,
      );
      console.log("0");
      if (!engine || !frame || !currentStatus || !lastLocation) {
        console.log("2");
        setError("Engine, Frame, Status, and Location are Required");
        return;
      }

      console.log("1");

      const unit = {
        engine: engine,
        frame: frame,
        model: model,
        color: color,
        da: "test",
        status: currentStatus,
        last_location_id: selectedLocation?.id,
      };

      const response = await api.insertNewUnit(unit);

      console.log("response: ", response);

      setUnit({
        ...unit,
        lastLocation: lastLocation,
      });

      setSubmitted(true);
      return response;
    } catch (err) {
      if (err.status === 409) {
        setError(err.message);
        return;
      }
      console.error("Save failed:", err);
      setError("Failed to save Unit. Please check your connection.");
    }
  };

  const handleConfirm = () => {
    setUnit(null);
    setEngine("");
    setFrame("");
    setModel("");
    setColor("");
    setLastLocation("");
    setCurrentStatus("");
    setError("");
    setSubmitted(false);
  };

  const handleGenericEnter = (e, nextRef, currentValue) => {
    if (e.key === "Enter" && currentValue && currentValue.trim() !== "") {
      focusNext(nextRef);
    }
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

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;

  return (
    <div className="page-centered page">
      {!submitted ? (
        <>
          <h1 className="page-title">Insert Unit</h1>
          <GenericInput
            // ref={}
            val={engine}
            setVal={setEngine}
            title={"Engine"}
            onKeyDown={(e) => handleGenericEnter(e, frameRef, engine)}
            placeholder={"Enter Engine Code"}
          />
          <GenericInput
            ref={frameRef}
            val={frame}
            setVal={setFrame}
            title={"Frame"}
            onKeyDown={(e) => handleGenericEnter(e, modelRef, frame)}
            placeholder={"Enter Frame Code"}
          />
          <GenericInput
            ref={modelRef}
            val={model}
            setVal={setModel}
            title={"Model"}
            onKeyDown={(e) => handleGenericEnter(e, colorRef, model)}
            placeholder={"Enter Model"}
          />
          <GenericInput
            ref={colorRef}
            val={color}
            setVal={setColor}
            title={"Color"}
            onKeyDown={(e) => handleGenericEnter(e, statusRef, color)}
            placeholder={"Enter Color"}
          />

          <GenericSelect
            ref={statusRef}
            selected={currentStatus}
            setSelected={(val) => {
              setCurrentStatus(val);
              focusNext(locationRef);
            }}
            title={"Current Status"}
            options={statusList}
            placeholder={"Select Unit's Status"}
          />

          <GenericSelect
            ref={locationRef}
            selected={lastLocation}
            setSelected={(val) => {
              setLastLocation(val);
              focusNext(submitRef);
            }}
            title={"Last Known Location"}
            options={locationsList}
            placeholder={"Select Last Known Location"}
          />

          {error && (
            <div
              style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            ref={submitRef}
            className="primary-btn"
            onClick={handleSubmit}
          >
            Insert Unit/s
          </button>
        </>
      ) : (
        unit && (
          <>
            <UnitConfirm unit={unit} onConfirm={handleConfirm} />
          </>
        )
      )}
    </div>
  );
}

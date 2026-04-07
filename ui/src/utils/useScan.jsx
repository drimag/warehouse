import { useState } from "react";
import { api } from "../services/api";

export const useScan = () => {
  // --- INTERNAL STATE ---
  const [selectedWaybill, setSelectedWaybill] = useState(null);
  const [waybillID, setWaybillID] = useState("");
  const [confirmedScans, setConfirmedScans] = useState([]);
  const [scan1, setScan1] = useState("");
  const [scan2, setScan2] = useState("");
  const [showRescan, setShowRescan] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [confirmQtyMismatch, setConfirmQtyMismatch] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- LOGIC HANDLERS ---

  const handleWaybillSelect = (id, validWaybills) => {
    const selectedDetails = validWaybills.find((wb) => wb.id === id);
    if (selectedDetails) {
      setWaybillID(id);
      setSelectedWaybill(selectedDetails);
    }
  };

  const startScan = async () => {
    setError("");
    setConfirmQtyMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(true);

    console.log("called startScan");
    console.log("waybillid: ", waybillID);
    try {
      await api.startLoading(waybillID);
    } catch (err) {
      console.error("❌ ERROR SETTING WAYBILL STATUS TO LOADING:", err);
    }
  };

  const handleNext = async () => {
    setError("");
    setConfirmQtyMismatch(false);

    const currentScan = scan1.trim();

    if (confirmedScans.includes(currentScan)) {
      setError(`Entry ${currentScan} Already Scanned. Please try again.`);
      setScan1("");
      setScan2("");
      return;
    }

    if (showRescan) {
      if (scan1 !== scan2) {
        setError("Mismatched scan values. Please try again.");
        setScan1("");
        setScan2("");
        setShowRescan(false);
      } else {
        try {
          const unit = await api.scanNewUnit(currentScan);
          if (!unit) {
            setError(`Error inserting new scan ${currentScan} in database.`);
            setShowRescan(false);
          }
        } catch (err) {
          console.error("❌ ERROR SEARCHING SCAN:", err);
          setError("Database connection error.");
          return;
        }
        finishScan(currentScan);
      }
      return;
    }

    try {
      const unit = await api.scanUnitByVin(currentScan);
      if (unit) {
        finishScan(currentScan);
      } else {
        setError(
          `Entry ${currentScan} not found in database. Please rescan to confirm.`,
        );
        setShowRescan(true);
      }
    } catch (err) {
      console.error("❌ ERROR SEARCHING SCAN:", err);
      setError("Database connection error. Try again.");
    }
  };

  const handleFinish = () => {
    const expected = selectedWaybill?.expected_quantity;

    if (expected && confirmedScans.length !== expected && !confirmQtyMismatch) {
      setError(
        "Scanned Entries Do Not Match Expected Quantity. If this is correct, click Finish again.",
      );
      setConfirmQtyMismatch(true);
      return;
    }

    setConfirmQtyMismatch(false);
    setShowModal(false);
    setSubmitted(true);
  };

  const handleEnd = () => {
    // TODO: actual uploading of changes to waybill and units via api.updateWaybill(...)
    setShowModal(false);
    setSubmitted(false);
    setSelectedWaybill(null);
    setWaybillID("");
    setConfirmedScans([]);
  };

  const handleCancel = async () => {
    try {
      await api.inStorage(waybillID);
    } catch (err) {
      console.error("❌ ERROR SETTING WAYBILL STATUS TO LOADING:", err);
    }
    console.log(confirmedScans);
    setError("");
    setScan1("");
    setScan2("");
    setConfirmQtyMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(false);
    setSubmitted(false);
  };

  const finishScan = (currentScan) => {
    setConfirmedScans((prev) => [...prev, currentScan]);
    setScan1("");
    setScan2("");
    setShowRescan(false);
  };

  // Return everything the component needs
  return {
    // State
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
    // Functions
    handleWaybillSelect,
    startScan,
    handleNext,
    handleFinish,
    handleEnd,
    handleCancel,
  };
};

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
  const [scanError, setScanError] = useState("");
  const [confirmQtyMismatch, setConfirmQtyMismatch] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- LOGIC HANDLERS ---

  const resetPage = () => {
    setError("");
    setScanError("");
    setScan1("");
    setScan2("");
    setConfirmQtyMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(false);
    setSubmitted(false);
  };

  const handleWaybillSelect = (id, validWaybills) => {
    const selectedDetails = validWaybills.find((wb) => wb.id === id);
    if (selectedDetails) {
      setWaybillID(id);
    }
  };

  const startScan = async () => {
    resetPage();
    setShowModal(true);

    try {
      await api.startLoading(waybillID);
    } catch (err) {
      console.scanError("❌ ERROR SETTING WAYBILL STATUS TO LOADING:", err);
    }
  };

  const handleNext = async () => {
    setScanError("");
    setConfirmQtyMismatch(false);

    const currentScan = scan1.trim();
    try {
      const wbLoading = await api.touchLoadingTimeout(waybillID);
    } catch (err) {
      console.error("❌ ERROR RESETING LOADING:", err);
      setScanError("Database connection error. Try again.");
      resetPage();
      setError("❌ SCAN ERROR. PLEASE TRY AGAIN");
      return;
    }

    if (confirmedScans.includes(currentScan)) {
      setScanError(`Entry ${currentScan} Already Scanned. Please try again.`);
      setScan1("");
      setScan2("");
      return;
    } else if (showRescan) {
      if (scan1 !== scan2) {
        setScanError("Mismatched scan values. Please try again.");
        setScan1("");
        setScan2("");
        setShowRescan(false);
      } else {
        finishScan(currentScan, true);
      }
      return;
    } else {
      try {
        const unit = await api.findUnitByVIN(currentScan);
        console.log("LOOK AT ME", unit);
        if (unit) {
          finishScan(currentScan, false);
        } else {
          setScanError(
            `Entry ${currentScan} not found in database. Please rescan to confirm.`,
          );
          setShowRescan(true);
        }
      } catch (err) {
        console.error("❌ ERROR SEARCHING SCAN:", err);
        setScanError("Database connection error. Try again.");
      }
    }
  };

  const handleFinish = () => {
    const expected = selectedWaybill?.expected_qty;

    if (expected && confirmedScans.length !== expected && !confirmQtyMismatch) {
      setScanError(
        "Scanned Entries Do Not Match Expected Quantity. If this is correct, click Finish again.",
      );
      setConfirmQtyMismatch(true);
      return;
    }

    setConfirmQtyMismatch(false);
    setShowModal(false);
    setSubmitted(true);
  };

  const handleEnd = async () => {
    try {
      const barcodes = confirmedScans.map((scan) => scan.value);

      await api.finalizeScan({
        waybillId: waybillID,
        barcodes: barcodes,
      });

      resetPage();
    } catch (err) {
      console.error(err);
      resetPage();
      setError(
        err.response?.data?.error || "A network error occurred while saving.",
      );
    }
  };

  const handleCancel = async () => {
    try {
      await api.setAdvice(waybillID);
    } catch (err) {
      console.error("❌ ERROR SETTING WAYBILL STATUS TO LOADING:", err);
    } finally {
      resetPage();
    }
  };

  const finishScan = (currentScan, isNew) => {
    setConfirmedScans((prev) => [
      ...prev,
      {
        value: currentScan,
        isNew: isNew,
      },
    ]);
    setScan1("");
    setScan2("");
    setShowRescan(false);
  };

  // Return everything the component needs
  return {
    // State
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
    scanError,
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

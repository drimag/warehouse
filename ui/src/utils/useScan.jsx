import { useState, useRef, useEffect } from "react";
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

  const scan1Ref = useRef(null);
  const scan2Ref = useRef(null);

  // --- LOGIC HANDLERS ---

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
      await api.startScanning(waybillID);
      focusNext(scan1Ref);
    } catch (err) {
      console.error("❌ ERROR STARTING WAYBILL SCAN:", err);
    }
  };

  const handleNext = async () => {
    setScanError("");
    setConfirmQtyMismatch(false);

    const currentScan = scan1.trim();
    try {
      const wbLoading = await api.touchLoadingTimeout(waybillID);
    } catch (err) {
      setScanError("Database connection error. Try again.");
      resetPage();
      setError("❌ SCAN ERROR. PLEASE TRY AGAIN");
      return;
    }

    let unit = null;
    let engine = null;

    try {
      unit = await api.findUnitByVIN(currentScan);
      engine = unit?.engine;
    } catch (err) {
      console.error("❌ ERROR SEARCHING SCAN:", err);
      setScanError("Database connection error. Try again.");
      focusNext(scan1Ref);
      return;
    }

    const isAlreadyScanned =
      confirmedScans.some(
        (scan) => scan.value.toLowerCase() === currentScan.toLowerCase(),
      ) ||
      (engine &&
        confirmedScans.some(
          (scan) => scan.value.toLowerCase() === engine.toLowerCase(),
        ));

    if (isAlreadyScanned) {
      setScanError(
        `${currentScan} or its Engine/Frame Already Scanned. Please Try Again.`,
      );
      setScan1("");
      setScan2("");
      focusNext(scan1Ref);
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
      focusNext(scan1Ref);
      return;
    }

    if (unit) {
      focusNext(scan1Ref);
      finishScan(engine, false);
    } else {
      setScanError(
        `Entry ${currentScan} not found in database. Please rescan to confirm.`,
      );
      setShowRescan(true);
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
      await api.cancelScanning(waybillID);
    } catch (err) {
      console.error("❌ ERROR CANCELLING WAYBILL SCAN:", err);
    } finally {
      resetPage();
    }
  };

  const finishScan = (referenceVIN, isNew) => {
    setConfirmedScans((prev) => [
      ...prev,
      {
        value: referenceVIN,
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
    focusNext,
    scan1Ref,
    scan2Ref,
  };
};

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
    }
  };

  const startScan = async () => {
    setError("");
    setConfirmQtyMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(true);

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
    } else if (showRescan) {
      if (scan1 !== scan2) {
        setError("Mismatched scan values. Please try again.");
        setScan1("");
        setScan2("");
        setShowRescan(false);
      } else {
        finishScan(currentScan, true);
      }
      return;
    } else {
      try {
        const unit = await api.scanUnitByVin(currentScan);
        if (unit) {
          finishScan(currentScan, false);
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
    }
  };

  const handleFinish = () => {
    const expected = selectedWaybill?.expected_qty;

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

  const handleEnd = async () => {
    try {
      const newUnits = confirmedScans.filter((scan) => !scan.isNew);
      for (const scan of newUnits) {
        await api.scanNewUnit(scan.value);
      }
      selectedWaybill.status === "ADVICE"
        ? await api.setInTransit(waybillID)
        : await api.setArrived(waybillID);
      for (const scan of confirmedScans) {
        await api.setUnitInTransit(scan.value);
        await api.createManifest(
          waybillID,
          scan.value,
          selectedWaybill.status === "ADVICE" ? "DEPARTURE" : "ARRIVAL",
          null,
        );
      }
    } catch (err) {
      console.log(err);
    }
    setError("");
    setShowModal(false);
    setSubmitted(false);
    setSelectedWaybill(null);
    setWaybillID("");
    setConfirmedScans([]);
  };

  const handleCancel = async () => {
    try {
      await api.setAdvice(waybillID);
    } catch (err) {
      console.error("❌ ERROR SETTING WAYBILL STATUS TO LOADING:", err);
    }
    setError("");
    setScan1("");
    setScan2("");
    setConfirmQtyMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(false);
    setSubmitted(false);
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

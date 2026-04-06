import { useState } from 'react';
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
  const [confirmMismatch, setConfirmMismatch] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- LOGIC HANDLERS ---

  const handleWaybillSelect = (id, validWaybills) => {
    const selectedDetails = validWaybills.find((wb) => wb.id === id);
    if (selectedDetails) {
      setWaybillID(id);
      setSelectedWaybill(selectedDetails);
    }
  };

  const startScan = () => {
    // TODO: set waybill status to loading in DB via api call
    setError("");
    setConfirmMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(true);
  };

  const handleNext = async () => {
    setError("");
    setConfirmMismatch(false);

    const currentScan = scan1.trim();

    // Check if already in our local list
    if (confirmedScans.includes(currentScan)) {
      setError(`Entry ${currentScan} Already Scanned. Please try again.`);
      setScan1("");
      setScan2("");
      return;
    }

    // Logic for Rescan Mode
    if (showRescan) {
      if (scan1 !== scan2) {
        setError("Mismatched scan values. Please try again.");
        setScan1("");
        setScan2("");
        setShowRescan(false);
      } else {
        setConfirmedScans(prev => [...prev, currentScan]);
        setScan1("");
        setScan2("");
        setShowRescan(false);
      }
      return;
    }

    // Database Lookup
    try {
      const unit = await api.findUnitByVin(currentScan);
      if (unit) {
        setConfirmedScans(prev => [...prev, currentScan]);
        setScan1("");
        setScan2("");
        setShowRescan(false);
      } else {
        setError(`Entry ${currentScan} not found in database. Please rescan to confirm.`);
        setShowRescan(true);
      }
    } catch (err) {
      console.error("❌ ERROR SEARCHING SCAN:", err);
      setError("Database connection error. Try again.");
    }
  };

  const handleFinish = () => {
    const expected = selectedWaybill?.expected_quantity;
    
    if (expected && confirmedScans.length !== expected && !confirmMismatch) {
      setError("Scanned Entries Do Not Match Expected Quantity. If this is correct, click Finish again.");
      setConfirmMismatch(true);
      return;
    }

    setConfirmMismatch(false);
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

  const handleCancel = () => {
    // TODO: turn waybill back to its previous status in DB
    setError("");
    setConfirmMismatch(false);
    setShowRescan(false);
    setConfirmedScans([]);
    setShowModal(false);
    setSubmitted(false);
  };

  // Return everything the component needs
  return {
    // State
    selectedWaybill, waybillID, confirmedScans, 
    scan1, setScan1, scan2, setScan2,
    showRescan, showModal, error, submitted,
    // Functions
    handleWaybillSelect, startScan, handleNext, 
    handleFinish, handleEnd, handleCancel
  };
};
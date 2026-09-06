const db = require("../config/db");
const Waybill = require("../models/waybillModel");
const History = require("../models/historyModel");
const { logActivity } = require("../utils/activityLogger");

exports.getAllWaybillDisplay = async (req, res) => {
  try {
    const waybills = await Waybill.getAllWaybillDisplay();
    res.json(waybills);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getWaybillDisplayById = async (req, res) => {
  try {
    const { id } = req.params;
    const waybill = await Waybill.getWaybillDisplayById(id);
    res.json(waybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getWaybillForScan = async (req, res) => {
  try {
    const waybills = await Waybill.getWaybillsForScan();
    res.json(waybills);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getWaybillDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [details, stateHistory, manifest] = await Promise.all([
      Waybill.getWaybillDisplayById(id),
      History.getWaybillStateHistory(id),
      Waybill.getWaybillManifestByWBID(id),
    ]);

    if (!details) {
      return res.status(404).json({ message: `Waybill ${id} not found.` });
    }

    res.json({ details, stateHistory, manifest });
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.startScanning = async (req, res) => {
  const waybillId = req.params.id;

  try {
    const waybillCheck = await Waybill.getWaybillInfo(waybillId);

    if (!waybillCheck) {
      return res.status(404).json({ error: "Waybill not found" });
    }

    const currentStatus = waybillCheck.status;
    let nextStatus = null;

    if (currentStatus === "ADVICE") {
      nextStatus = "LOADING";
    } else if (currentStatus === "IN_TRANSIT") {
      nextStatus = "UNLOADING";
    } else {
      return res.status(400).json({
        error: `Cannot start scanning. Waybill is currently in '${currentStatus}' status.`,
      });
    }

    const updatedWaybill = await Waybill.setStatus(waybillId, nextStatus);
    return res.status(200).json(updatedWaybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.cancelScanning = async (req, res) => {
  const waybillId = req.params.id;

  try {
    const waybillCheck = await Waybill.getWaybillInfo(waybillId);

    if (!waybillCheck) {
      return res.status(404).json({ error: "Waybill not found" });
    }

    const currentStatus = waybillCheck.status;
    let nextStatus = null;

    if (currentStatus === "LOADING") {
      nextStatus = "ADVICE";
    } else if (currentStatus === "UNLOADING") {
      nextStatus = "IN_TRANSIT";
    } else {
      return res.status(400).json({
        error: `Cannot cancel scanning. Waybill is currently in '${currentStatus}' status.`,
      });
    }

    const updatedWaybill = await Waybill.setStatus(waybillId, nextStatus);
    return res.status(200).json(updatedWaybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.saveWaybillForm = async (req, res) => {
  try {
    const {
      code, status, origin_id, destination_id,
      client, driver_id, truck_id, expected_quantity, expected_arrival,
    } = req.body;

    if (!origin_id || !destination_id || !client) {
      return res.status(400).json({ error: "Origin and Destination are mandatory" });
    }

    const result = await Waybill.insertFromForm({
      code, status, origin_id, destination_id,
      client, driver_id, truck_id, expected_quantity, expected_arrival,
    });

    res.status(200).json({ message: "Created successfully", id: result.id || null });
  } catch (err) {
    console.error("--- BACKEND CRASH ---");
    console.error(err.stack);
    console.error("---------------------");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.touchLoadingTimeout = async (req, res) => {
  const waybillId = req.params.id;

  try {
    const updatedWaybill = await Waybill.touchLoadingTimeout(waybillId);

    if (!updatedWaybill) {
      return res.status(409).json({
        error: "Session expired. This waybill is no longer locked to your terminal.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lock extended successfully.",
      expiresAt: updatedWaybill.loading_started_at,
    });
  } catch (err) {
    console.error("❌ Heartbeat error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.closeWaybill = async (req, res) => {
  const { id } = req.params;
 
  // closeUnits: boolean sent from frontend — whether to also mark arrival units as CLOSED
  const closeUnits = req.body.closeUnits === true;
 
  const client = await db.connect();
 
  try {
    await client.query("BEGIN");
 
    const waybill = await Waybill.getCloseCheck(client, id);
 
    if (!waybill) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Waybill not found." });
    }
 
    const { status, expected_quantity, arrival_count } = waybill;
 
    if (status !== "ARRIVED") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Cannot close waybill. Current status is ${status}.`,
      });
    }
 
    if (expected_quantity && parseInt(arrival_count) !== expected_quantity) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `Cannot close. Expected ${expected_quantity} units at arrival but only ${arrival_count} were scanned.`,
      });
    }
 
    // Close the waybill — SCD2 trigger fires automatically
    await Waybill.setClosed(client, id);
 
    await logActivity({
      client,
      userEmail: req.user.email,
      entityType: "waybill",
      entityId: id,
      eventType: "MANUAL_CLOSE",
      metadata: {
        previous_status: "ARRIVED",
        new_status: "CLOSED",
        arrival_count: parseInt(arrival_count),
        expected_quantity,
        units_closed: closeUnits,
      },
      description: `Waybill closed by ${req.user.email}.${closeUnits ? " Arrival units marked as CLOSED." : ""}`,
    });
 
    // Optionally close all units that arrived on this waybill
    let closedUnits = [];
    if (closeUnits) {
      closedUnits = await Waybill.closeArrivalUnits(client, id);
 
      // Log the unit closures as a single batch entry
      await logActivity({
        client,
        userEmail: req.user.email,
        entityType: "waybill",
        entityId: id,
        eventType: "BULK_UNIT_CLOSE",
        metadata: {
          waybill_id: id,
          units_closed: closedUnits.map((u) => u.engine),
          count: closedUnits.length,
        },
        description: `${closedUnits.length} arrival unit(s) marked CLOSED by ${req.user.email} on waybill close.`,
      });
    }
 
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Waybill closed successfully.",
      unitsClosed: closedUnits.length,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ ERROR CLOSING WAYBILL:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};
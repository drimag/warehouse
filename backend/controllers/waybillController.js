const Waybill = require("../models/waybillModel");
const History = require("../models/historyModel");

exports.getAllWaybillDisplay = async (req, res) => {
  try {
    const waybills = await Waybill.getAllWaybillDisplay();
    res.json(waybills);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getWaybillDisplayById = async (req, res) => {
  try {
    const { id } = req.params;
    const waybills = await Waybill.getWaybillDisplayById(id);
    res.json(waybills);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getWaybillForScan = async (req, res) => {
  try {
    const waybills = await Waybill.getWaybillsForScan();
    res.json(waybills);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getWaybillDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await Waybill.getWaybillDisplayById(id);
    const [stateHistory, manifest] = await Promise.all([
      History.getWaybillStateHistory(id),
      Waybill.getWaybillManifestByWBID(id),
    ]);

    if (!details) {
      return res.status(404).json({ message: `Waybill ${id} not found.` });
    }

    res.json({
      details,
      stateHistory,
      manifest,
    });
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
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
        error: `Cannot start scanning. Waybill is currently in '${currentStatus}' status.` 
      });
    }

    const updatedWaybill = await Waybill.setStatus(waybillId, nextStatus);
    return res.status(200).json(updatedWaybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    return res.status(500).json({ error: err.message });
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
        error: `Cannot cancel scanning. Waybill is currently in '${currentStatus}' status.` 
      });
    }

    const updatedWaybill = await Waybill.setStatus(waybillId, nextStatus);
    return res.status(200).json(updatedWaybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.setInTransit = async (req, res) => {
  console.log("called set In transit");
  try {
    const waybill = await Waybill.setStatus(req.params.id, "IN_TRANSIT");
    if (!waybill) {
      return res.status(404).json({ error: "Waybill not found" });
    }
    return res.status(200).json(waybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.setArrived = async (req, res) => {
  console.log("called set arrvied");
  try {
    const waybill = await Waybill.setStatus(req.params.id, "ARRIVED");
    if (!waybill) {
      return res.status(404).json({ error: "Waybill not found" });
    }
    return res.status(200).json(waybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.saveWaybillForm = async (req, res) => {
  try {
    const {
      code,
      status,
      origin_id,
      destination_id,
      client,
      driver_id,
      truck_id,
      expected_quantity,
      expected_arrival,
    } = req.body;

    if (!origin_id || !destination_id || !client) {
      return res
        .status(400)
        .json({ error: "Origin and Destination are mandatory" });
    }

    const result = await Waybill.insertFromForm({
      code,
      status,
      origin_id,
      destination_id,
      client,
      driver_id,
      truck_id,
      expected_quantity,
      expected_arrival,
    });

    res.status(200).json({
      message: "Created successfully",
      id: result.id || null,
    });
  } catch (err) {
    console.error("--- BACKEND CRASH ---");
    console.error(err.stack);
    console.error("---------------------");

    res.status(500).json({ error: err.message });
  }
};

exports.touchLoadingTimeout = async (req, res) => {
  const waybillId = req.params.id;

  try {
    const updatedWaybill = await Waybill.touchLoadingTimeout(waybillId);

    if (!updatedWaybill) {
      return res.status(409).json({
        error:
          "Session expired. This waybill is no longer locked to your terminal.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lock extended successfully.",
      expiresAt: updatedWaybill.loading_started_at,
    });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return res.status(500);
  }
};

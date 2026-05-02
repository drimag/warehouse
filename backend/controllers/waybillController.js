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

exports.startLoading = async (req, res) => {
  try {
    const waybill = await Waybill.setStatus(req.params.id, "LOADING");
    if (!waybill) {
      return res.status(404).json({ error: "Waybill not found" });
    }
    return res.status(200).json(waybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.setAdvice = async (req, res) => {
  try {
    const waybill = await Waybill.setStatus(req.params.id, "ADVICE");
    if (!waybill) {
      return res.status(404).json({ error: "Waybill not found" });
    }
    return res.status(200).json(waybill);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
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
    const { status, origin_id, destination_id, client, driver_id, truck_id } = req.body;

    if (!origin_id || !destination_id || !client) {
      return res
        .status(400)
        .json({ error: "Origin and Destination are mandatory" });
    }

    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");

    const count = await Waybill.getTodayCount();
    const sequence = String(count + 1).padStart(2, "0");

    // const prefix = `${origin.substring(0, 3).toUpperCase()}-${destination.substring(0, 3).toUpperCase()}`;
    const prefix = 'SAM-PLE';

    const id = `${prefix}-${dateStr}-${sequence}`;

    const result = await Waybill.insertFromForm({
      id,
      status,
      origin_id,
      destination_id,
      client,
      driver_id,
      truck_id
    });

    res.status(200).json({
      message: "Created successfully",
      id: result.id,
    });
  } catch (err) {
    console.error("--- BACKEND CRASH ---");
    console.error(err.stack);
    console.error("---------------------");

    res.status(500).json({ error: err.message });
  }
};

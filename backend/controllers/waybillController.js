const Waybill = require("../models/waybillModel");
const History = require("../models/historyModel");
const Advice = require("../models/adviceModel");

exports.getAllWaybillDisplay = async (req, res) => {
  try {
    const waybills = await Waybill.getAllWaybillDisplay();
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
    const [stateHistory, advice, manifest, unitAdvice] = await Promise.all([
      History.getWaybillStateHistory(id),
      Advice.getWaybillAdviceById(details.advice_id),
      Waybill.getWaybillManifestByWBID(id),
      Advice.getUnitAdviceByWbAdviceId(details.advice_id),
    ]);

    if (!details) {
      return res.status(404).json({ message: `Waybill ${id} not found.` });
    }

    res.json({
      details,
      stateHistory,
      advice,
      manifest,
      unitAdvice,
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


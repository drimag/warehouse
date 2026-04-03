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

exports.getWaybillDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const details = await Waybill.getWaybillDisplayById(id);
    const [stateHistory, advice, manifest, unitAdvice] = await Promise.all([
      History.getWaybillStateHistory(id),
      Advice.getWaybillAdviceById(details.advice_id),
      Waybill.getWaybillManifestByWBID(id),
      Advice.getUnitAdviceByWbAdviceId(details.advice_id)
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

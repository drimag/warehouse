const Waybill = require('../models/waybillModel');
const History = require('../models/historyModel');

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
    const [details, stateHistory] = await Promise.all([
      Waybill.getWaybillDisplayById(id),
      History.getWaybillStateHistory(id)
    ]);

    if (!details) {
      return res.status(404).json({ message: `Waybill ${id} not found.` });
    }

    console.log("stateHistory: ", stateHistory);

    res.json({
      details,
      stateHistory
    });

  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
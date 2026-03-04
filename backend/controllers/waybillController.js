const Waybill = require('../models/waybillModel');

exports.getAllWaybills = async (req, res) => {
  try {
    const waybills = await Waybill.getAllWaybills();
    res.json(waybills);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getWaybillInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const waybillInfo = await Waybill.getWaybillInfo(id);
    res.json(waybillInfo);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
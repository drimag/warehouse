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
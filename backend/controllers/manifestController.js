const History = require('../models/historyModel');

exports.createManifest = async(req, res) => {
  try {
    const { waybillId, unitId, type, userId } = req.params;
    const manifest = History.createManifest(waybillId, unitId, type, userId);
    res.json(manifest);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
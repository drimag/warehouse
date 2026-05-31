const History = require("../models/historyModel");

exports.createManifest = async (req, res) => {
  const { waybillId, unitScannedCode, type, userId } = req.body;
  try {
    const manifest = History.createManifest(
      waybillId,
      unitScannedCode,
      type,
      userId,
    );
    
    res.json(manifest);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

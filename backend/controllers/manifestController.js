const History = require("../models/historyModel");
const Waybill = require("../models/waybillModel");

exports.createManifest = async (req, res) => {
  const { waybillId, unitScannedCode, type } = req.body;
  const userId = req.user.email;

  console.log("called create manifest: ", userId);
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

exports.finalizeScan = async (req, res) => {
  const { waybillId, barcodes } = req.body;
  const userId = req.user.email;

  if (!waybillId || !Array.isArray(barcodes)) {
    return res.status(400).json({ error: "Invalid payload structure." });
  }

  try {
    const result = await Waybill.processBulkManifest(waybillId, barcodes, userId);

    return res.status(200).json({
      success: true,
      message: "Manifest saved and waybill status advanced successfully.",
      currentStatus: result.status
    });
  } catch (error) {
    console.error("Transaction failed, rolled back seamlessly:", error);
    
    // Handle specific custom errors thrown by your model layer
    if (error.message.includes("expired") || error.message.includes("status")) {
      return res.status(409).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error saving manifest." });
  }
};

exports.getUnitManifest = async (req, res) => {
  const { unitId } = req.params;
  try {
    const history = await History.getUnitManifest(unitId);
    res.json(history);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
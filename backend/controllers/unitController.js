const Unit = require("../models/unitModel");
const History = require("../models/historyModel");

exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.getAll();
    return res.json(units);
  } catch (err) {
    console.error("❌ ERROR FETCHING UNITS:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUnitHistory = async (req, res) => {
  try {
    const { unitID } = req.params;
    const [details, stateHistory] = await Promise.all([
      Unit.getById(unitID),
      History.getUnitStateHistory(unitID),
      // TODO: decide if audit logs should be displayed
      // History.getAuditLogs('UNIT', unitID)
    ]);

    if (!details) {
      return res.status(404).json({ message: `Engine ${unitID} not found.` });
    }

    return res.json({
      details,
      stateHistory,
    });
  } catch (err) {
    console.error(`❌ ERROR FETCHING UNIT ${req.params.unitID}:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.findUnitByVin = async (req, res) => {
  try {
    const { scan } = req.params;
    const unit = await Unit.findByVin(scan);

    if (!unit) {
      return res.json(null);
    }

    return res.json(unit);
  } catch (err) {
    console.error(`❌ ERROR SEARCHING SCAN ${req.params.scan}:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

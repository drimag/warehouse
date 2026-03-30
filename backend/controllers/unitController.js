const Unit = require('../models/unitModel');
const History = require('../models/historyModel');

exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.getAll();
    res.json(units);
  } catch (err) {
    console.error("❌ ERROR FETCHING UNITS:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUnitHistory = async (req, res) => {
  try {
    const { unitID } = req.params;
    const [details, stateHistory] = await Promise.all([
      Unit.getById(unitID),
      History.getUnitStateHistory(unitID)
      // TODO: decide if audit logs should be displayed
      // History.getAuditLogs('UNIT', unitID)
    ]);

    if (!details) {
      return res.status(404).json({ message: `Engine ${unitID} not found.` });
    }

    res.json({
      details,
      stateHistory
    });
  } catch (err) {
    console.error(`❌ ERROR FETCHING UNIT ${req.params.unitID}:`, err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
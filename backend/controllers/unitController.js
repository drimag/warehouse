const Unit = require('../models/unitModel');

exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.fetchAll();
    res.json(units);
  } catch (err) {
    console.error("❌ ERROR FETCHING UNITS:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUnitHistory = async (req, res) => {
  try {
    const { engine } = req.params;
    const data = await Unit.getUnitHistory(engine);

    if (!data.details) {
      return res.status(404).json({ message: `Engine ${engine} not found.` });
    }

    res.json(data);
  } catch (err) {
    console.error(`❌ ERROR FETCHING ENGINE ${req.params.engine}:`, err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
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

exports.scanUnitByVin = async (req, res) => {
  try {
    const { scan } = req.params;
    let unit = await Unit.findByVin(scan);

    if (!unit) {
      return res.json(null);
    } else {
      try {
        unit = await Unit.setStatus(unit.id, "LOADING");
        console.log(`✅ Updated existing unit ${scan} to LOADING`);
        return res.json(unit);
      } catch (err) {
        console.error(
          `❌ ERROR SETTING UNIT STATUS TO LOADING ${req.params.scan}:`,
          err.message,
        );
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } catch (err) {
    console.error(`❌ ERROR SEARCHING SCAN ${req.params.scan}:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.newScannedUnit = async (req, res) => {
  try {
    const { scan } = req.params;
    const unit = await Unit.createNew(scan, "LOADING");
    console.log(`✨ Created new unit for scan ${scan} with status LOADING`);
    return res.json(unit);
  } catch (err) {
    console.error(
      `❌ ERROR CREATING NEW UNIT FROM SCAN ${req.params.scan}:`,
      err.message,
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.setUnitInTransit = async (req, res) => {
  try {
    const { scan } = req.params;
    let unit = await Unit.findByVin(scan);

    if (!unit) {
      return res.json(null);
    } else {
      try {
        unit = await Unit.setStatus(unit.id, "IN_TRANSIT");
        console.log(`✅ Updated existing unit ${scan} to IN_TRANSIT`);
        return res.json(unit);
      } catch (err) {
        console.error(
          `❌ ERROR SETTING UNIT STATUS TO IN_TRANSIT ${req.params.scan}:`,
          err.message,
        );
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } catch (err) {
    console.error(`❌ ERROR SEARCHING SCAN ${req.params.scan}:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.insertNewUnit = async (req, res) => {
  try {
    const { engine, frame, model, color, status, da, last_location_id } =
      req.body;

    if (!engine) {
      return res.status(400).json({ error: "Engine number is required" });
    }

    const newUnit = await Unit.createNew({
      engine,
      frame,
      model,
      color,
      status,
      da,
      last_location_id,
    });

    console.log(`✅ Unit Inserted: ${newUnit.engine}`);
    return res.status(201).json(newUnit);
  } catch (err) {
    if (err.code === "23505") {
      console.error(`❌ Duplicate Entry: ${err.detail}`);
      return res.status(409).json({
        error: err.detail,
      });
    }

    console.error(`❌ ERROR INSERTING UNIT:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

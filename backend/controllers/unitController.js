const db = require("../config/db");
const Unit = require("../models/unitModel");
const History = require("../models/historyModel");
const { logActivity } = require("../utils/activityLogger");

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

    return res.json({ details, stateHistory });
  } catch (err) {
    console.error(`❌ ERROR FETCHING UNIT ${req.params.unitID}:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.findUnitByVIN = async (req, res) => {
  try {
    const { scan } = req.params;
    const unit = await Unit.findByVin(scan);
    return res.json(unit);
  } catch (err) {
    console.error(`❌ ERROR SEARCHING SCAN ${req.params.scan}:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.insertNewUnit = async (req, res) => {
  try {
    const { engine, frame, model, color, status, da, last_location_id } = req.body;

    if (!engine) {
      return res.status(400).json({ error: "Engine number is required" });
    }

    const newUnit = await Unit.createNew({ engine, frame, model, color, status, da, last_location_id });
    console.log(`✅ Unit Inserted: ${newUnit.engine}`);
    return res.status(201).json(newUnit);
  } catch (err) {
    if (err.code === "23505") {
      console.error(`❌ Duplicate Entry: ${err.detail}`);
      return res.status(409).json({ error: err.detail });
    }
    console.error(`❌ ERROR INSERTING UNIT:`, err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.getWithLocation(id);

    if (!unit) return res.status(404).json({ error: "Unit not found." });

    const activityLog = await Unit.getActivityLogs(id);
    return res.status(200).json({ unit, activityLog });
  } catch (err) {
    console.error("❌ ERROR FETCHING UNIT:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateUnit = async (req, res) => {
  const { id } = req.params;
  const updates = Unit.filterEditableFields(req.body);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update." });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const previousState = await Unit.findById(client, id);
    if (!previousState) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Unit not found." });
    }

    const updated = await Unit.updateFields(client, id, updates);

    await logActivity({
      client,
      userEmail: req.user.email,
      entityType: "unit",
      entityId: id,
      eventType: "MANUAL_EDIT",
      metadata: { before: previousState, after: updates },
      description: `Unit manually edited by ${req.user.email}. Fields changed: ${Object.keys(updates).join(", ")}.`,
    });

    await client.query("COMMIT");
    return res.status(200).json(updated);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ ERROR UPDATING UNIT:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};
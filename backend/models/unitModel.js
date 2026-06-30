const db = require("../config/db");
const History = require("../models/historyModel");
const crypto = require('crypto'); 

const Unit = {};
Unit.getAll = async () => {
  const query = `
      SELECT 
        u.*, 
        l.name AS last_known_location
      FROM units u
      LEFT JOIN locations l ON u.last_location_id = l.id
      ORDER BY u.updated_at DESC
    `;
  const [res] = await db.execute(query);
  return res;
};

Unit.getAllEngines = async () => {
  const query = `
      SELECT engine
      FROM units 
      ORDER BY updated_at DESC
    `;
  const res = await db.execute(query);

  return res.rows.map((row) => (row.engine ? row.engine.toString() : ""));
};

Unit.getById = async (id) => {
  const query = `
      SELECT 
        u.*, 
        l.name AS last_known_location 
      FROM units u
      LEFT JOIN locations l ON u.last_location_id = l.id
      WHERE u.id = ?
    `;
  const res = await db.execute(query, [id]);
  return res.rows;
};

Unit.createNew = async (unitData) => {
  const {
    engine,
    frame,
    model,
    color,
    status = "IN_STORAGE",
    da,
    last_location_id,
  } = unitData;

  const query = `
      INSERT INTO units (
        engine, 
        frame, 
        model, 
        color, 
        status, 
        da, 
        last_location_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `;

  const values = [engine, frame, model, color, status, da, last_location_id];

  const [result] = await db.execute(query, values);
  if (result.affectedRows === 0) {
    throw new Error("Failed to Insert New Row");
  }

  return { success: true, engine: engine, status };
};

Unit.setStatus = async (id, status) => {
  const query = `UPDATE units SET status = ?, updated_at = NOW() WHERE id = ? RETURNING *;`;
  const [result] = await db.execute(query, [status, id]);
  if (result.affectedRows === 0) {
    throw new Error("Failed to Set Unit Status to ", status);
  }
  return { success: true, id: id, status };
};

Unit.findByVin = async (vin) => {
  const query = `
      SELECT * FROM units 
      WHERE engine = ? OR frame = ? 
      LIMIT 1;
    `;
  const res = await db.execute(query, [vin, vin]);
  return res.rows[0] || null;
};

Unit.insertBulkUnits = async (unitsData, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    for (const unit of unitsData) {
      const newUnitId = crypto.randomUUID();

      // Insert the unit with the pre-generated ID
      const insertUnitQuery = `
        INSERT INTO units (id, engine, frame, model, color, status, da, last_location_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.query(insertUnitQuery, [
        newUnitId,
        unit.engine,
        unit.frame,
        unit.model,
        unit.color,
        unit.status,
        unit.da,
        unit.last_location_id,
      ]);

      // Look up the waybill's current status
      const [waybillRows] = await connection.query(
        'SELECT status FROM waybills WHERE id = ?',
        [unit.waybill_code]
      );

      if (waybillRows.length === 0) {
        throw new Error(`Waybill not found: ${unit.waybill_code}`);
      }

      const waybillStatus = waybillRows[0].status;

      let manifestType;
      if (['ADVICE', 'LOADING'].includes(waybillStatus)) {
        manifestType = 'ADVICE';
      } else if (['IN_TRANSIT', 'UNLOADING'].includes(waybillStatus)) {
        manifestType = 'DEPARTURE';
      } else if (['ARRIVED', 'CLOSED'].includes(waybillStatus)) {
        manifestType = 'ARRIVAL';
      } else {
        manifestType = 'UNKNOWN';
      }

      // Insert into waybill_manifest (also needs its own UUID)
      const manifestId = crypto.randomUUID();

      await connection.query(
        `INSERT INTO waybill_manifest (id, unit_id, waybill_id, manifest_type, user_id)
         VALUES (?, ?, ?, ?, ?)`,
        [manifestId, newUnitId, unit.waybill_code, manifestType, userId]
      );
    }

    await connection.commit();
    return { success: true, count: unitsData.length };
  } catch (error) {
    await connection.rollback();
    console.error('Bulk Insert Failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

Unit.updateBulkUnits = async (unitsData, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Since MySQL doesn't have UNNEST, we'll do this in multiple steps
    for (const unit of unitsData) {
      // Step 1: Update the unit
      const updateQuery = `
        UPDATE units 
        SET 
          engine = ?,
          frame = ?,
          model = ?,
          color = ?,
          status = ?,
          da = ?,
          last_location_id = ?
        WHERE engine = ?
      `;

      await connection.execute(updateQuery, [
        unit.new_engine,
        unit.new_frame,
        unit.new_model,
        unit.new_color,
        unit.new_status,
        unit.new_da,
        unit.new_last_location_id,
        unit.old_engine,
      ]);

      // Step 2: Get the updated unit's ID
      const [unitRows] = await connection.execute(
        "SELECT id FROM units WHERE engine = ?",
        [unit.new_engine],
      );

      if (unitRows.length > 0) {
        const unitId = unitRows[0].id;

        // Step 3: Get waybill status
        const [waybillRows] = await connection.execute(
          "SELECT status FROM waybills WHERE id = ?",
          [unit.new_waybill_code],
        );

        if (waybillRows.length > 0) {
          const waybillStatus = waybillRows[0].status;

          let manifestType;
          if (["ADVICE", "LOADING"].includes(waybillStatus)) {
            manifestType = "ADVICE";
          } else if (["IN_TRANSIT", "UNLOADING"].includes(waybillStatus)) {
            manifestType = "DEPARTURE";
          } else if (["ARRIVED", "CLOSED"].includes(waybillStatus)) {
            manifestType = "ARRIVAL";
          } else {
            manifestType = "UNKNOWN";
          }

          // Step 4: Insert into waybill_manifest
          const insertQuery = `
            INSERT INTO waybill_manifest (unit_id, waybill_id, manifest_type, user_id)
            VALUES (?, ?, ?, ?)
          `;

          await connection.execute(insertQuery, [
            unitId,
            unit.new_waybill_code,
            manifestType,
            userId,
          ]);
        }
      }
    }

    await connection.commit();
    return { success: true, count: unitsData.length };
  } catch (error) {
    await connection.rollback();
    console.error("Bulk Update Failed:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = Unit;

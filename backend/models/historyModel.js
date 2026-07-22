const db = require("../config/db");
const crypto = require("crypto");
const {
  WAYBILL_STATUS_TO_MANIFEST_TYPE,
} = require("../controllers/bulkUpload/bulkUploadConstants");

const History = {};

History.getUnitStateHistory = async (unitId) => {
  const query = `
      SELECT 
        uh.id, 
        uh.unit_id, 
        uh.engine, 
        uh.frame, 
        uh.model, 
        uh.color, 
        uh.status, 
        uh.da, 
        -- Join location name for the audit trail
        l.name AS last_known_location,
        uh.eff_start, 
        uh.eff_end, 
        uh.is_current 
      FROM unit_history uh
      LEFT JOIN locations l ON uh.last_location_id = l.id
      WHERE uh.unit_id = $1 
      ORDER BY uh.eff_start DESC;
    `;

  const res = await db.query(query, [unitId]);
  return res.rows;
};

// Page 2 & 4: Get Audit Logs (Scans/Actions)
History.getAuditLogs = async (entityType, entityId) => {
  const res = await db.query(
    "SELECT created_at, event_type, metadata, user_id FROM activity_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC",
    [entityType, entityId],
  );
  return res.rows;
};

History.getManifest = async (waybillId) => {
  const query = `
      SELECT u.engine, u.frame, m.manifest_type, m.created_at
      FROM waybill_manifest m
      JOIN units u ON m.unit_id = u.id
      WHERE m.waybill_id = $1
      ORDER BY m.created_at ASC`;
  const res = await db.query(query, [waybillId]);
  return res.rows;
};

History.getUnitManifest = async (unitId) => {
  const query = `
      SELECT waybill_id, manifest_type, created_at
      FROM waybill_manifest 
      WHERE unit_id = $1
      ORDER BY created_at ASC`;
  const res = await db.query(query, [unitId]);
  return res.rows;
};

History.createManifest = async (waybillId, unitScannedCode, type, userId) => {
  const query = `
    INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type, user_id)
    VALUES (
      $1, 
      (SELECT id FROM units WHERE engine = $2 OR frame = $2 LIMIT 1), 
      $3, 
      $4
    )
    RETURNING *;
  `;

  const res = await db.query(query, [waybillId, unitScannedCode, type, userId]);

  if (res.rows.length === 0) {
    throw new Error("Failed to log manifest item.");
  }

  return res.rows[0];
};

History.getWaybillStateHistory = async (waybillId) => {
  const query = `
      SELECT 
        wh.id, 
        wh.waybill_id, 
        wh.status, 
        -- Join names for history display
        o.name AS origin, 
        d.name AS destination, 
        t.plate_number AS truck, 
        dr.full_name AS driver, 
        -- Metadata and Photos
        wh.departure_photo_url, 
        wh.arrival_photo_url, 
        wh.eff_start, 
        wh.eff_end, 
        wh.is_current 
      FROM waybill_history wh
      LEFT JOIN locations o ON wh.origin_id = o.id
      LEFT JOIN locations d ON wh.destination_id = d.id
      LEFT JOIN trucks t ON wh.truck_id = t.id
      LEFT JOIN drivers dr ON wh.driver_id = dr.id
      WHERE wh.waybill_id = $1 
      ORDER BY wh.eff_start DESC;
    `;

  const res = await db.query(query, [waybillId]);
  return res.rows;
};

History.insertBulkManifestByEngine = async (data, userId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    for (const entry of data) {
      // 1. Look up unit by engine number
      const unitRes = await client.query(
        `SELECT id FROM units WHERE engine = $1 LIMIT 1`,
        [entry.engine],
      );

      if (unitRes.rows.length === 0) {
        throw new Error(`Unit with engine "${entry.engine}" not found`);
      }

      const unitId = unitRes.rows[0].id;

      // 2. Look up waybill status
      const waybillRes = await client.query(
        `SELECT status FROM waybills WHERE id = $1 LIMIT 1`,
        [entry.waybill_code],
      );

      if (waybillRes.rows.length === 0) {
        throw new Error(`Waybill "${entry.waybill_code}" not found`);
      }

      const manifestType = WAYBILL_STATUS_TO_MANIFEST_TYPE(
        waybillRes.rows[0].status,
      );

      // 3. Insert manifest entry
      await client.query(
        `INSERT INTO waybill_manifest (id, unit_id, waybill_id, manifest_type, user_id)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [unitId, entry.waybill_code, manifestType, userId],
      );
    }

    await client.query("COMMIT");
    return { success: true, count: data.length };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Bulk Manifest Insert Failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = History;

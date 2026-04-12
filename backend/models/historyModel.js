const db = require("../config/db");

const History = {
  // Page 2: Get SCD2 History for a Unit
  getUnitStateHistory: async (unitId) => {
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
  },

  // Page 2 & 4: Get Audit Logs (Scans/Actions)
  getAuditLogs: async (entityType, entityId) => {
    const res = await db.query(
      "SELECT created_at, event_type, metadata, user_id FROM activity_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC",
      [entityType, entityId],
    );
    return res.rows;
  },

  // Page 4 & 5: Get Scans via the Manifest
  getManifest: async (waybillId) => {
    const query = `
      SELECT u.engine, u.frame, m.manifest_type, m.created_at
      FROM waybill_manifest m
      JOIN units u ON m.unit_id = u.id
      WHERE m.waybill_id = $1
      ORDER BY m.created_at ASC`;
    const res = await db.query(query, [waybillId]);
    return res.rows;
  },

  createManifest: async (waybillId, unitId, type, userId) => {
    const query = `
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await db.query(query, [waybillId, unitId, type, userId]);
    return res.rows[0];
  },

  getWaybillStateHistory: async (waybillId) => {
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
  },
};

module.exports = History;

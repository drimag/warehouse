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
      WHERE uh.unit_id = ? 
      ORDER BY uh.eff_start DESC;
    `;

    const [res] = await db.execute(query, [unitId]);
    return res;
  },

  // Page 2 & 4: Get Audit Logs (Scans/Actions)
  getAuditLogs: async (entityType, entityId) => {
    const [res] = await db.execute(
      "SELECT created_at, event_type, metadata, user_id FROM activity_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC",
      [entityType, entityId],
    );
    return res;
  },

  getManifest: async (waybillId) => {
    const query = `
      SELECT u.engine, u.frame, m.manifest_type, m.created_at
      FROM waybill_manifest m
      JOIN units u ON m.unit_id = u.id
      WHERE m.waybill_id = ?
      ORDER BY m.created_at ASC`;
    const [res] = await db.execute(query, [waybillId]);
    return res;
  },

  createManifest: async (waybillId, unitScannedCode, type, userId) => {
    const query = `
    INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type, user_id)
    VALUES (
      ?, 
      (SELECT id FROM units WHERE engine = ? OR frame = ? LIMIT 1), 
      ?, 
      ?
    )
    RETURNING *;
  `;

    const [res] = await db.query(query, [
      waybillId,
      unitScannedCode,
      type,
      type,
      userId,
    ]);

    if (res.affectedRows === 0) {
      throw new Error("Failed to Insert New User");
    }
    return { success: true, scan: unitScannedCode, wbID: waybillId };
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
      WHERE wh.waybill_id = ? 
      ORDER BY wh.eff_start DESC;
    `;

    const [res] = await db.execute(query, [waybillId]);
    return res;
  },
};

module.exports = History;

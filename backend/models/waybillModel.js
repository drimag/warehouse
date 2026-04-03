const db = require("../config/db");

const Waybill = {
  // Page 3: Display all waybills
  getAllWaybills: async () => {
    const res = await db.query("SELECT * FROM waybills");
    return res.rows;
  },

  getWaybillsForScan: async () => {
    const query = `
      SELECT *
      FROM waybills w
      WHERE w.status = 'IN_TRANSIT' OR w.status = 'IN_STORAGE'
    `;

    const res = await db.query(query);
    return res.rows;
  },

  getAllWaybillDisplay: async () => {
    const query = `
    SELECT 
      w.*, 
      wa.expected_quantity AS expected_qty,
      (
        SELECT COUNT(*) 
        FROM waybill_manifest wm 
        WHERE wm.waybill_id = w.id 
        AND (
          -- If status is ARRIVED or CLOSED, count the 'DROPOFF' (Arrival) scans
          (w.status IN ('ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
          OR 
          -- Otherwise, count the 'PICKUP' (Departure) scans
          (w.status IN ('LOADING', 'IN_TRANSIT') AND wm.manifest_type = 'DEPARTURE')
        )
      ) AS actual_qty
    FROM waybills w
    LEFT JOIN waybill_advice wa ON w.advice_id = wa.id
  `;

    const res = await db.query(query);
    return res.rows;
  },

  getWaybillDisplayById: async (id) => {
    const query = `
      SELECT 
        w.*, 
        wa.expected_quantity AS expected_qty,
        (
          SELECT COUNT(*)::INT 
          FROM waybill_manifest wm 
          WHERE wm.waybill_id = w.id 
          AND (
            -- If status is ARRIVED or CLOSED, count the 'ARRIVAL' scans
            (w.status IN ('ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
            OR 
            -- Otherwise, count the 'DEPARTURE' scans
            (w.status IN ('LOADING', 'IN_TRANSIT') AND wm.manifest_type = 'DEPARTURE')
          )
        ) AS actual_qty
      FROM waybills w
      LEFT JOIN waybill_advice wa ON w.advice_id = wa.id
      WHERE w.id = $1;
    `;

    const res = await db.query(query, [id]);
    
    // Return the first row (or null if not found)
    return res.rows[0] || null;
  },

  // Page 4: Display particular waybill + Advice info
  getWaybillInfo: async (id) => {
    const query = `
      SELECT w.*, wa.expected_quantity, wa.status as advice_status
      FROM waybills w
      LEFT JOIN waybill_advice wa ON w.advice_id = wa.id
      WHERE w.id = $1`;
    const res = await db.query(query, [id]);
    return res.rows[0];
  },

  getWaybillManifestByWBID: async (wbID) => {
    const query = `
      SELECT 
        wm.id,
        wm.waybill_id,
        wm.unit_id,
        u.engine,
        wm.manifest_type,
        wm.user_id,
        wm.created_at
      FROM waybill_manifest wm
      LEFT JOIN units u ON wm.unit_id = u.id
      WHERE wm.waybill_id = $1;
    `;
    const res = await db.query(query, [wbID]);
    return res.rows || null;
  },

  // Page 5/6: Create or Update Waybill
  upsert: async (data) => {
    const {
      id,
      advice_id,
      status,
      origin,
      destination,
      client,
      truck,
      driver,
    } = data;
    const query = `
      INSERT INTO waybills (id, advice_id, status, origin, destination, client, truck_plate, driver_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        truck_plate = EXCLUDED.truck_plate,
        driver_name = EXCLUDED.driver_name
      RETURNING *`;
    const res = await db.query(query, [
      id,
      advice_id,
      status,
      origin,
      destination,
      client,
      truck,
      driver,
    ]);
    return res.rows[0];
  },
};

module.exports = Waybill;

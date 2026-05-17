const db = require("../config/db");
const { checkAndResetSequence } = require("../utils/waybillUtils");

const Waybill = {
  // Page 3: Display all waybills
  getAllWaybills: async () => {
    const res = await db.query("SELECT * FROM waybills");
    return res.rows;
  },

  getAllWaybillCodes: async () => {
    const query = "SELECT id FROM waybills";
    const { rows } = await db.query(query);
    return rows.map((row) => row.id);
  },

  getWaybillsForScan: async () => {
    const query = `
      SELECT w.*
      FROM waybills w
      WHERE w.status = 'IN_TRANSIT' OR w.status = 'ADVICE'
    `;

    const res = await db.query(query);
    return res.rows;
  },

  getAllWaybillDisplay: async () => {
    const query = `
      SELECT 
        w.*, 
        -- Location Names
        o.name AS origin,
        d.name AS destination,
        -- Truck and Driver Names
        t.plate_number AS truck,
        dr.full_name AS driver,
        
        -- Subquery for Expected Quantity (from the ADVICE manifest)
        (
          SELECT COUNT(*) 
          FROM waybill_manifest wm 
          WHERE wm.waybill_id = w.id 
          AND wm.manifest_type = 'ADVICE'
        ) AS expected_qty,

        -- Subquery for Actual Quantity based on the Waybill's current status
        (
          SELECT COUNT(*) 
          FROM waybill_manifest wm 
          WHERE wm.waybill_id = w.id 
          AND (
            (w.status IN ('ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
            OR 
            (w.status IN ('LOADING', 'IN_TRANSIT') AND wm.manifest_type = 'DEPARTURE')
          )
        ) AS actual_qty
      FROM waybills w
      -- Join Locations
      LEFT JOIN locations o ON w.origin_id = o.id
      LEFT JOIN locations d ON w.destination_id = d.id
      -- Join Trucks and Drivers
      LEFT JOIN trucks t ON w.truck_id = t.id
      LEFT JOIN drivers dr ON w.driver_id = dr.id
    `;

    const res = await db.query(query);
    return res.rows;
  },

  getWaybillDisplayById: async (id) => {
    const query = `
      SELECT 
          w.*, 
          -- Location Names
          o.name AS origin,
          d.name AS destination,
          -- Truck and Driver Names
          t.plate_number AS truck,
          dr.full_name AS driver,
          -- Subquery for Expected Quantity (Unified from Manifest)
          (
            SELECT COUNT(*)::INT 
            FROM waybill_manifest wm 
            WHERE wm.waybill_id = w.id 
            AND wm.manifest_type = 'ADVICE'
          ) AS expected_qty,
          -- Subquery for Actual Quantity based on Status
          (
            SELECT COUNT(*)::INT 
            FROM waybill_manifest wm 
            WHERE wm.waybill_id = w.id 
            AND (
              (w.status IN ('ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
              OR 
              (w.status IN ('IN_TRANSIT', 'LOADING') AND wm.manifest_type = 'DEPARTURE')
            )
          ) AS actual_qty
        FROM waybills w
        -- Join Locations
        LEFT JOIN locations o ON w.origin_id = o.id
        LEFT JOIN locations d ON w.destination_id = d.id
        -- Join Trucks and Drivers
        LEFT JOIN trucks t ON w.truck_id = t.id
        LEFT JOIN drivers dr ON w.driver_id = dr.id
        WHERE w.id = $1;
      `;

    const res = await db.query(query, [id]);

    // Return the first row (or null if not found)
    return res.rows[0] || null;
  },

  // Page 4: Display particular waybill + Advice info
  getWaybillInfo: async (id) => {
    const query = `
      SELECT w.*
      FROM waybills w
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

  //TODO: confirm if correct
  getTodayCount: async () => {
    const query = `
      SELECT COUNT(*) as total 
      FROM waybills 
      WHERE updated_at::date = CURRENT_DATE
    `;
    const result = await db.query(query);
    return parseInt(result.rows[0].total);
  },

  insertFromForm: async (data) => {
    const {
      id,
      status,
      origin_id,
      destination_id,
      client,
      driver_id,
      truck_id,
    } = data;

    const query = `
      INSERT INTO waybills (id, status, origin_id, destination_id, client, driver_id, truck_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await db.query(query, [
      id,
      status,
      origin_id,
      destination_id,
      client,
      driver_id || null,
      truck_id || null,
    ]);
    return res.rows[0];
  },

  setStatus: async (waybillId, status) => {
    const validStatuses = [
      "ADVICE",
      "LOADING",
      "IN_TRANSIT",
      "ARRIVED",
      "CLOSED",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const query = `
      UPDATE waybills 
      SET 
        status = $2
      WHERE id = $1
      RETURNING *;
    `;

    const res = await db.query(query, [waybillId, status]);
    return res.rows[0];
  },

  insertBulkWaybills: async (data) => {
    await checkAndResetSequence();
    const query = `
      INSERT INTO waybills (
        id, status, origin_id, destination_id, 
        client, truck_id, driver_id, expected_quantity, expected_arrival
      )
      SELECT 
        d.id || '-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('waybill_code_seq')::text, 4, '0'),
        d.status, 
        d.origin_id, 
        d.destination_id, 
        d.client, 
        d.truck_id, 
        d.driver_id, 
        d.expected_quantity, 
        d.expected_arrival
      FROM UNNEST($1::text[], $2::text[], $3::int[], $4::int[], $5::text[], $6::int[], $7::int[], $8::int[], $9::timestamp[]) 
      AS d(id, status, origin_id, destination_id, client, truck_id, driver_id, expected_quantity, expected_arrival)
      RETURNING id;
    `;

    const values = [
      data.map((d) => d.id),
      data.map((d) => d.status),
      data.map((d) => d.origin_id),
      data.map((d) => d.destination_id),
      data.map((d) => d.client),
      data.map((d) => d.truck_id),
      data.map((d) => d.driver_id),
      data.map((d) => d.expected_quantity),
      data.map((d) => d.expected_arrival),
    ];

    const result = await db.query(query, values);
    return result.rows;
  },
};

module.exports = Waybill;

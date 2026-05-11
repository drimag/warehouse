const db = require("../config/db");
const History = require("../models/historyModel");

const Unit = {
  getAll: async () => {
    const query = `
      SELECT 
        u.*, 
        l.name AS last_known_location
      FROM units u
      LEFT JOIN locations l ON u.last_location_id = l.id
      ORDER BY u.updated_at DESC
    `;
    const res = await db.query(query);
    return res.rows;
  },

  getById: async (id) => {
    const query = `
      SELECT 
        u.*, 
        l.name AS last_known_location 
      FROM units u
      LEFT JOIN locations l ON u.last_location_id = l.id
      WHERE u.id = $1
    `;
    const res = await db.query(query, [id]);
    return res.rows[0];
  },

  createNew: async (unitData) => {
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
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [engine, frame, model, color, status, da, last_location_id];

    const res = await db.query(query, values);
    return res.rows[0];
  },

  setStatus: async (id, status) => {
    const query = `UPDATE units SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *;`;
    const res = await db.query(query, [id, status]);
    return res.rows[0];
  },

  findByVin: async (vin) => {
    const query = `
      SELECT * FROM units 
      WHERE engine = $1 OR frame = $1 
      LIMIT 1;
    `;
    const res = await db.query(query, [vin]);
    console.log("vin, unit ", vin, res.rows[0]);
    return res.rows[0] || null;
  },

  insertBulkUnits: async (unitsData, userId) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const engines = unitsData.map((u) => u.engine);
      const frames = unitsData.map((u) => u.frame);
      const models = unitsData.map((u) => u.model);
      const colors = unitsData.map((u) => u.color);
      const statuses = unitsData.map((u) => u.status);
      const das = unitsData.map((u) => u.da);
      const locIds = unitsData.map((u) => u.last_location_id);
      const waybillNos = unitsData.map((u) => u.waybill_code);

      const query = `
        WITH inserted_units AS (
          INSERT INTO units (engine, frame, model, color, status, da, last_location_id)
          SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::int[])
          RETURNING id, engine
        ),
        input_data AS (
          SELECT UNNEST($1::text[]) as eng, UNNEST($8::text[]) as waybill_no
        )
        INSERT INTO waybill_manifest (unit_id, waybill_id, manifest_type, user_id)
        SELECT 
          iu.id, 
          idat.waybill_no, 
          wb.status,
          $9 
        FROM inserted_units iu
        JOIN input_data idat ON iu.engine = idat.eng
        JOIN waybills wb ON idat.waybill_no = wb.id;
      `;

      const values = [
        engines, // $1
        frames, // $2
        models, // $3
        colors, // $4
        statuses, // $5
        das, // $6
        locIds, // $7
        waybillNos, // $8
        userId, // $9
      ];

      const result = await client.query(query, values);

      await client.query("COMMIT");
      return { success: true, count: unitsData.length };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("UNNEST Bulk Insert Failed:", error);
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = Unit;

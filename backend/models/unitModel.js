const db = require("../config/db");
const History = require("../models/historyModel");

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
  const res = await db.query(query);
  return res.rows;
};

Unit.getAllEngines = async () => {
  const query = `
      SELECT engine
      FROM units 
      ORDER BY updated_at DESC
    `;
  const res = await db.query(query);
  
  return res.rows.map(row => row.engine ? row.engine.toString() : "");
};

Unit.getById = async (id) => {
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
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

  const values = [engine, frame, model, color, status, da, last_location_id];

  const res = await db.query(query, values);
  return res.rows[0];
};

Unit.setStatus = async (id, status) => {
  const query = `UPDATE units SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *;`;
  const res = await db.query(query, [id, status]);
  return res.rows[0];
};

Unit.findByVin = async (vin) => {
  const query = `
      SELECT * FROM units 
      WHERE engine = $1 OR frame = $1 
      LIMIT 1;
    `;
  const res = await db.query(query, [vin]);
  return res.rows[0] || null;
};

Unit.insertBulkUnits = async (unitsData, userId) => {
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
};

Unit.updateBulkUnits = async (unitsData, userId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const old_engines = unitsData.map((u) => u.old_engine);
    const new_engines = unitsData.map((u) => u.new_engine);
    const frames = unitsData.map((u) => u.new_frame);
    const models = unitsData.map((u) => u.new_model);
    const colors = unitsData.map((u) => u.new_color);
    const statuses = unitsData.map((u) => u.new_status);
    const das = unitsData.map((u) => u.new_da);
    const locIds = unitsData.map((u) => u.new_last_location_id);
    const waybillNos = unitsData.map((u) => u.new_waybill_code);

    const query = `
        WITH updated_units AS (
          UPDATE units AS u
          SET 
            engine = COALESCE(d.new_engine, u.engine),
            frame = COALESCE(d.new_frame, u.frame),
            model = COALESCE(d.model, u.model),
            color = COALESCE(d.color, u.color),
            status = COALESCE(d.status, u.status),
            da = COALESCE(d.da, u.da),
            last_location_id = COALESCE(d.last_location_id, u.last_location_id)
          FROM UNNEST(
            $1::text[],      -- current_engine 
            $2::text[],      -- new_engine
            $3::text[],      -- new_frame
            $4::text[],      -- model
            $5::text[],      -- color
            $6::text[],      -- status
            $7::text[],      -- da
            $8::int[]        -- last_location_id
          ) AS d(curr_eng, new_engine, new_frame, model, color, status, da, last_location_id)
          WHERE u.engine = d.curr_eng
          RETURNING u.id, u.engine
        ),
        input_waybills AS (
          -- Maps the current engine to the waybill ID provided in the sheet
          SELECT 
            UNNEST($1::text[]) as curr_eng, 
            UNNEST($9::text[]) as waybill_no
        )
        INSERT INTO waybill_manifest (unit_id, waybill_id, manifest_type, user_id)
        SELECT 
          uu.id, 
          iw.waybill_no, 
          wb.status,
          $10 
        FROM updated_units uu
        JOIN input_waybills iw ON uu.engine = iw.curr_eng
        JOIN waybills wb ON iw.waybill_no = wb.id; 
      `;

    const values = [
      old_engines, // $1
      new_engines, // $2
      frames, // $3
      models, // $4
      colors, // $5
      statuses, // $6
      das, // $7
      locIds, // $8
      waybillNos, // $9
      userId, // $10
    ];

    const result = await client.query(query, values);

    await client.query("COMMIT");
    return { success: true, count: unitsData.length };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("UNNEST Bulk Update Failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = Unit;

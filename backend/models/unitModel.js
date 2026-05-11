const db = require("../config/db");

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

  insertBulk: async (engines, frames, models, colors) => {
    const query = `
      INSERT INTO units (engine, frame, model, color)
      SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[])
      ON CONFLICT (engine) DO NOTHING
      RETURNING *;
    `;
    
    const result = await db.query(query, [engines, frames, models, colors]);
    return result.rows;
  },
};

module.exports = Unit;

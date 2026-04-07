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

  updateStatus: async (id, status, locationId, client) => {
    const query = `
      UPDATE units 
      SET 
        status = $2, 
        last_location_id = $3, 
        updated_at = now() 
      WHERE id = $1 
      RETURNING *`;
    // We pass the locationId (integer) here
    const res = await client.query(query, [id, status, locationId]);
    return res.rows[0];
  },

  createNew: async (engine, status) => {
    const query = `
    INSERT INTO units (engine, status)
    VALUES ($1, $2)
    RETURNING *;
  `;
    const values = [engine, status];
    const res = await db.query(query, values);
    return res.rows[0];
  },

  setStatus: async (id, status) => {
    const query = `UPDATE units SET status = $2 WHERE id = $1 RETURNING *;`;
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
};

module.exports = Unit;

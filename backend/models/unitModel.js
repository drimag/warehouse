const db = require("../config/db");

const Unit = {
  // Page 1: Display all units
  // Page 1: List all units
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

  // Page 2: Display particular unit with its location name
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

  // Page 5: Update Unit during Scan
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

  // Page 7: Post new units
  create: async (engine, frame, status, locationId) => {
    const query = `
      INSERT INTO units (engine, frame, status, last_location_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const res = await db.query(query, [engine, frame, status, locationId]);
    return res.rows[0];
  },
};

module.exports = Unit;

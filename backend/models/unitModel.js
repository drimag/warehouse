const db = require("../config/db");

const Unit = {
  // Page 1: Display all units
  getAll: async () => {
    const res = await db.query(
      'SELECT id, engine, frame, model, color, da, status, current_location FROM units ORDER BY updated_at DESC'
    );
    return res.rows;
  },

  // Page 2: Display particular unit
  getById: async (id) => {
    const res = await db.query('SELECT * FROM units WHERE id = $1', [id]);
    return res.rows[0];
  },

  // Page 5: Update Unit during Scan
  // Note: The trigger will automatically create the unit_history entry
  updateStatus: async (id, status, location, client) => {
    const query = `
      UPDATE units 
      SET status = $2, current_location = $3, updated_at = now() 
      WHERE id = $1 
      RETURNING *`;
    const res = await client.query(query, [id, status, location]);
    return res.rows[0];
  },

  // Page 7: Post new units
  create: async (engine, frame, status, location) => {
    const res = await db.query(
      'INSERT INTO units (engine, frame, status, current_location) VALUES ($1, $2, $3, $4) RETURNING *',
      [engine, frame, status, location]
    );
    return res.rows[0];
  }
};

module.exports = Unit;
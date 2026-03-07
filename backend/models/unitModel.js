const db = require('../config/db');

const Unit = {
  // Get all units for the main Inventory list
  fetchAll: async () => {
    const query = `
      SELECT engine, frame, model, color, status, da, last_warehouse 
      FROM units 
      ORDER BY engine ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  // Get specific unit details + its chronological history
  getUnitHistory: async (engine) => {
    const unitDetails = await db.query(
      "SELECT * FROM units WHERE engine = $1", 
      [engine]
    );

    const historyQuery = `
      SELECT 
        ul.event,
        ul.timestamp,
        ul.user_id,
        wl.status AS movement_status,
        wl.waybill_id,
        wl.driver,
        wl.truck,
        w.origin,
        w.destination
      FROM unit_logs ul
      LEFT JOIN waybill_logs wl ON ul.waybill_log_id = wl.id
      LEFT JOIN waybills w ON wl.waybill_id = w.id
      WHERE ul.engine = $1
      ORDER BY ul.timestamp DESC;
    `;
    
    const history = await db.query(historyQuery, [engine]);

    return {
      details: unitDetails.rows[0],
      history: history.rows
    };
  },

  updateLocation: async (engine, warehouse, status) => {
    const query = `
      UPDATE units 
      SET current_warehouse = $2, status = $3 
      WHERE engine = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [engine, warehouse, status]);
    return rows[0];
  }
};

module.exports = Unit;
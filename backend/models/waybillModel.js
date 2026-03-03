const db = require('../config/db');

const Waybill = {
  fetchAll: async () => {
    const query = `
      SELECT w.*, COUNT(l.id) AS log_count 
      FROM waybills w
      LEFT JOIN waybill_logs l ON w.id = l.waybill_id
      GROUP BY w.id
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM waybills WHERE id = $1', [id]);
    return rows[0];
  }
};

module.exports = Waybill;
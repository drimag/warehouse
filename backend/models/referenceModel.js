const db = require("../config/db");

const ReferenceModel = {
  // Works for 'locations', 'trucks', or 'drivers'
  getAll: async (tableName) => {
    const res = await db.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
    return res.rows;
  },

  getById: async (tableName, id) => {
    const res = await db.query(`SELECT * FROM ${tableName} WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  },

  // Useful for your GenericSelect components
  getOptions: async (tableName) => {
    const res = await db.query(
      `SELECT id AS value, name AS label FROM ${tableName}`,
    );
    return res.rows;
  },

  getAllLocationIds: async () => {
    const query = "SELECT id FROM locations";
    const { rows } = await db.query(query);
    return rows.map((row) => row.id);
  },
};

module.exports = ReferenceModel;

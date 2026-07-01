const db = require("../config/db");

const ReferenceModel = {
  // Works for 'locations', 'trucks', or 'drivers'
  getAll: async (tableName) => {
    const [res] = await db.execute(
      `SELECT * FROM ${tableName} ORDER BY id ASC`,
    );
    return res;
  },

  getById: async (tableName, id) => {
    const [res] = await db.execute(
      `SELECT * FROM ${tableName} WHERE id = ${id}`,
    );
    return res;
  },

  getOptions: async (tableName) => {
    const [res] = await db.execute(
      `SELECT id AS value, name AS label FROM ${tableName}`,
    );
    return res;
  },

  getAllLocationIds: async () => {
    const [rows] = await db.query(`SELECT id FROM locations`);
    return rows.map((row) => row.id);
  },
};

module.exports = ReferenceModel;

const db = require("../config/db");

const checkAndResetSequence = async () => {
  const res = await db.query(`
    SELECT updated_at FROM waybills 
    ORDER BY updated_at DESC LIMIT 1
  `);

  if (res.rows.length > 0) {
    const lastDate = new Date(res.rows[0].updated_at).toDateString();
    const today = new Date().toDateString();

    if (lastDate !== today) {
      await db.query("ALTER SEQUENCE waybill_code_seq RESTART WITH 1");
    }
  }
};

module.exports = {
  checkAndResetSequence,
};
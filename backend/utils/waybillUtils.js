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

const cleanupLoadingQuery = `
  UPDATE waybills 
  SET 
    status = CASE 
      WHEN status = 'LOADING' THEN 'ADVICE'::valid_waybill_status
      WHEN status = 'UNLOADING' THEN 'IN_TRANSIT'::valid_waybill_status
    END,
    loading_started_at = NULL
  WHERE status IN ('LOADING', 'UNLOADING') 
    AND loading_started_at < NOW() - INTERVAL '15 minutes';
`;

module.exports = {
  checkAndResetSequence,
  cleanupLoadingQuery,
};

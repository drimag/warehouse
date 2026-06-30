const db = require("../config/db");

const checkAndResetSequence = async () => {
  const [res] = await db.execute(`
    SELECT updated_at FROM waybills 
    ORDER BY updated_at DESC LIMIT 1
  `);

  if (res.length > 0) {
    const lastDate = new Date(res[0].updated_at).toDateString();
    const today = new Date().toDateString();

    if (lastDate !== today) {
      // Reset counter for new day - MySQL will handle it automatically
      // since we use date-based counter, but you can delete old entries if needed
      await db.execute(
        `DELETE FROM waybill_counters WHERE date_created < DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );
    }
  }
};

const cleanupLoadingQuery = `
  UPDATE waybills 
  SET 
    status = CASE 
      WHEN status = 'LOADING' THEN 'ADVICE'
      WHEN status = 'UNLOADING' THEN 'IN_TRANSIT'
    END,
    loading_started_at = NULL
  WHERE status IN ('LOADING', 'UNLOADING') 
    AND loading_started_at < NOW() - INTERVAL 15 MINUTE;
`;

module.exports = {
  checkAndResetSequence,
  cleanupLoadingQuery,
};

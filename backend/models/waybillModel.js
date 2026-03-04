const db = require("../config/db");

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
    const { rows } = await db.query("SELECT * FROM waybills WHERE id = $1", [
      id,
    ]);
    return rows[0];
  },

  getAllWaybills: async () => {
    const query = `
      SELECT 
        w.id, w.origin, w.destination, w.status, w.client,
        latest_log.driver, latest_log.truck, latest_log.quantity AS actual_qty,
        latest_log.timestamp AS last_updated,
        wa.expected_qty
      FROM waybills w
      LEFT JOIN wb_advice wa ON w.id = wa.waybill_id
      LEFT JOIN (
        SELECT DISTINCT ON (waybill_id) 
          waybill_id, driver, truck, quantity, timestamp
        FROM waybill_logs
        ORDER BY waybill_id, timestamp DESC
      ) latest_log ON w.id = latest_log.waybill_id
      ORDER BY last_updated DESC NULLS LAST;
    `;

    const { rows } = await db.query(query);
    return rows; // Just return the rows!
  },

  getWaybillInfo: async (id) => {
    const detailsQuery = `
      SELECT 
        w.id, w.origin, w.destination, w.status, w.client,
        latest_log.driver, 
        latest_log.truck, 
        latest_log.quantity AS actual_qty,
        latest_log.timestamp AS last_updated,
        wa.expected_qty
      FROM waybills w
      LEFT JOIN wb_advice wa ON w.id = wa.waybill_id
      LEFT JOIN (
        SELECT DISTINCT ON (waybill_id) 
          waybill_id, driver, truck, quantity, timestamp
        FROM waybill_logs
        ORDER BY waybill_id, timestamp DESC
      ) latest_log ON w.id = latest_log.waybill_id
      WHERE w.id = $1; -- Filtering for the specific ID here
    `;

    // Run all queries for the details page
    const [details, logs, advice, scans] = await Promise.all([
      db.query(detailsQuery, [id]),
      db.query(
        "SELECT * FROM waybill_logs WHERE waybill_id = $1 ORDER BY timestamp DESC",
        [id],
      ),
      db.query("SELECT * FROM wb_advice WHERE waybill_id = $1", [id]),
      db.query(`
        SELECT 
          s.*, 
          l.status AS log_status -- Renaming the log's status to avoid conflict
        FROM waybill_scans s
        JOIN waybill_logs l ON s.waybill_log_id = l.id
        WHERE l.waybill_id = $1
        ORDER BY s.timestamp DESC
      `,
        [id],
      ),
    ]);

    return {
      details: details.rows[0], // Now contains actual_qty, truck, driver, etc.
      logs: logs.rows,
      advice: advice.rows,
      scans: scans.rows,
    };
  },
};

module.exports = Waybill;

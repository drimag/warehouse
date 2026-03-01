const db = require('../config/db');

exports.getAllWaybills = async (req, res) => {
  try {
    const query = `
      SELECT 
        w.*, 
        COUNT(l.id) AS log_count 
      FROM waybills w
      LEFT JOIN waybill_logs l ON w.id = l.waybill_id
      GROUP BY w.id
      ORDER BY w.id ASC;
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
const pool = require('../config/db');

// exports.getAllWaybills = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM waybills');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
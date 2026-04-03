const db = require("../config/db");

const Advice = {
  getWaybillAdviceById: async (id) => {
    const query = `
      SELECT 
        id,
        origin,
        destination,
        client,
        truck,
        driver,
        expected_quantity::INT,
        created_at
      FROM waybill_advice
      WHERE id = $1;
    `;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  },

  getUnitAdviceByWbAdviceId: async (wbAdviceId) => {
    const query = `
      SELECT 
        ua.id,
        ua.advice_id,
        ua.unit_id,
        u.engine,
        ua.created_at
      FROM unit_advice ua
      LEFT JOIN units u ON ua.unit_id = u.id
      WHERE ua.advice_id = $1;
    `;
    const res = await db.query(query, [wbAdviceId]);
    return res.rows || null;
  }
}

module.exports = Advice;
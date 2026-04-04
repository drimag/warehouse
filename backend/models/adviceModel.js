const db = require("../config/db");

const Advice = {
  getWaybillAdviceById: async (id) => {
    const query = `
      SELECT 
        wa.id,
        -- Location Names (using aliases o and d)
        o.name AS origin,
        d.name AS destination,
        -- Truck and Driver Names
        t.plate_number AS truck,
        dr.full_name AS driver,
        -- Original fields
        wa.client,
        wa.expected_quantity::INT,
        wa.created_at
      FROM waybill_advice wa
      -- Join Locations twice
      LEFT JOIN locations o ON wa.origin_id = o.id
      LEFT JOIN locations d ON wa.destination_id = d.id
      -- Join Trucks and Drivers
      LEFT JOIN trucks t ON wa.truck_id = t.id
      LEFT JOIN drivers dr ON wa.driver_id = dr.id
      WHERE wa.id = $1;
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
  },
};

module.exports = Advice;

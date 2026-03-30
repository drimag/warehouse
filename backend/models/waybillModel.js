const db = require("../config/db");

const Waybill = {
  // Page 3: Display all waybills
  getAll: async () => {
    const res = await db.query('SELECT * FROM waybills ORDER BY actual_departure_at DESC NULLS FIRST');
    return res.rows;
  },

  // Page 4: Display particular waybill + Advice info
  getDetails: async (id) => {
    const query = `
      SELECT w.*, wa.expected_quantity, wa.status as advice_status
      FROM waybills w
      LEFT JOIN waybill_advice wa ON w.advice_id = wa.id
      WHERE w.id = $1`;
    const res = await db.query(query, [id]);
    return res.rows[0];
  },

  // Page 5/6: Create or Update Waybill
  upsert: async (data) => {
    const { id, advice_id, status, origin, destination, client, truck, driver } = data;
    const query = `
      INSERT INTO waybills (id, advice_id, status, origin, destination, client, truck_plate, driver_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        truck_plate = EXCLUDED.truck_plate,
        driver_name = EXCLUDED.driver_name
      RETURNING *`;
    const res = await db.query(query, [id, advice_id, status, origin, destination, client, truck, driver]);
    return res.rows[0];
  }
};

module.exports = Waybill;
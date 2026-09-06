const db = require("../config/db");
const {
  checkAndResetSequence,
  cleanupLoadingQuery,
} = require("../utils/waybillUtils");

const Waybill = {};

Waybill.getAllWaybills = async () => {
  const res = await db.query("SELECT * FROM waybills");
  return res.rows;
};

Waybill.getAllWaybillCodes = async () => {
  const { rows } = await db.query("SELECT id FROM waybills");
  return rows.map((row) => row.id);
};

Waybill.getWaybillsForScan = async () => {
  await db.query(cleanupLoadingQuery);
  const query = `
    SELECT w.*
    FROM waybills w
    WHERE w.status = 'IN_TRANSIT' OR w.status = 'ADVICE'
  `;
  const res = await db.query(query);
  return res.rows;
};

Waybill.getAllWaybillDisplay = async () => {
  const query = `
    SELECT 
      w.*, 
      o.name AS origin,
      d.name AS destination,
      t.plate_number AS truck,
      dr.full_name AS driver,
      (
        SELECT COUNT(*) 
        FROM waybill_manifest wm 
        WHERE wm.waybill_id = w.id 
        AND (
          (w.status IN ('ADVICE') AND wm.manifest_type = 'ADVICE')
          OR (w.status IN ('UNLOADING', 'ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
          OR (w.status IN ('LOADING', 'IN_TRANSIT') AND wm.manifest_type = 'DEPARTURE')
        )
      ) AS actual_qty
    FROM waybills w
    LEFT JOIN locations o  ON w.origin_id = o.id
    LEFT JOIN locations d  ON w.destination_id = d.id
    LEFT JOIN trucks t     ON w.truck_id = t.id
    LEFT JOIN drivers dr   ON w.driver_id = dr.id
  `;
  const res = await db.query(query);
  return res.rows;
};

Waybill.getWaybillDisplayById = async (id) => {
  const query = `
    SELECT 
      w.*, 
      o.name AS origin,
      d.name AS destination,
      t.plate_number AS truck,
      dr.full_name AS driver,
      (
        SELECT COUNT(*)::INT 
        FROM waybill_manifest wm 
        WHERE wm.waybill_id = w.id 
        AND (
          (w.status IN ('ADVICE') AND wm.manifest_type = 'ADVICE')
          OR (w.status IN ('ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
          OR (w.status IN ('IN_TRANSIT', 'LOADING') AND wm.manifest_type = 'DEPARTURE')
        )
      ) AS actual_qty
    FROM waybills w
    LEFT JOIN locations o  ON w.origin_id = o.id
    LEFT JOIN locations d  ON w.destination_id = d.id
    LEFT JOIN trucks t     ON w.truck_id = t.id
    LEFT JOIN drivers dr   ON w.driver_id = dr.id
    WHERE w.id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
};

Waybill.getWaybillInfo = async (id) => {
  const query = `SELECT w.* FROM waybills w WHERE w.id = $1`;
  const res = await db.query(query, [id]);
  return res.rows[0];
};

Waybill.getWaybillManifestByWBID = async (wbID) => {
  const query = `
    SELECT 
      wm.id,
      wm.waybill_id,
      wm.unit_id,
      u.engine,
      wm.manifest_type,
      wm.user_id,
      wm.created_at,
      CASE 
        WHEN wm.manifest_type = 'DEPARTURE' AND NOT EXISTS (
          SELECT 1 FROM waybill_manifest prev
          WHERE prev.unit_id = wm.unit_id
            AND prev.waybill_id = wm.waybill_id
            AND prev.manifest_type = 'ADVICE'
        ) THEN true
        WHEN wm.manifest_type = 'ARRIVAL' AND NOT EXISTS (
          SELECT 1 FROM waybill_manifest prev
          WHERE prev.unit_id = wm.unit_id
            AND prev.waybill_id = wm.waybill_id
            AND prev.manifest_type = 'DEPARTURE'
        ) THEN true
        ELSE false
      END AS is_unexpected
    FROM waybill_manifest wm
    LEFT JOIN units u ON wm.unit_id = u.id
    WHERE wm.waybill_id = $1
    ORDER BY wm.created_at;
  `;
  const res = await db.query(query, [wbID]);
  return res.rows || null;
};

Waybill.getTodayCount = async () => {
  const query = `
    SELECT COUNT(*) as total 
    FROM waybills 
    WHERE updated_at::date = CURRENT_DATE
  `;
  const result = await db.query(query);
  return parseInt(result.rows[0].total);
};

Waybill.setStatus = async (waybillId, status) => {
  const validStatuses = ["ADVICE", "LOADING", "IN_TRANSIT", "UNLOADING", "ARRIVED", "CLOSED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const query = `
    UPDATE waybills 
    SET 
      status = $2::text,
      loading_started_at = CASE 
        WHEN $2::text = 'LOADING' THEN NOW() 
        ELSE NULL 
      END
    WHERE id = $1
    RETURNING *;
  `;
  const res = await db.query(query, [waybillId, status]);
  return res.rows[0];
};

Waybill.touchLoadingTimeout = async (waybillId) => {
  await db.query(cleanupLoadingQuery);
  const query = `
    UPDATE waybills 
    SET loading_started_at = NOW()
    WHERE id = $1 AND status IN ('LOADING', 'UNLOADING')
    RETURNING *;
  `;
  const res = await db.query(query, [waybillId]);
  return res.rows[0] || null;
};

// Used by closeWaybill controller — accepts a transaction client
Waybill.getCloseCheck = async (client, id) => {
  const result = await client.query(
    `SELECT
       w.status,
       w.expected_quantity,
       COUNT(wm.id) FILTER (WHERE wm.manifest_type = 'ARRIVAL') AS arrival_count
     FROM waybills w
     LEFT JOIN waybill_manifest wm ON wm.waybill_id = w.id
     WHERE w.id = $1
     GROUP BY w.id`,
    [id]
  );
  return result.rows[0] || null;
};

// Used by closeWaybill controller — accepts a transaction client
Waybill.setClosed = async (client, id) => {
  const result = await client.query(
    `UPDATE waybills SET status = 'CLOSED', updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

Waybill.insertFromForm = async (data) => {
  const {
    code, status, origin_id, destination_id,
    client, driver_id, truck_id, expected_quantity, expected_arrival,
  } = data;

  const query = `
    INSERT INTO waybills (
      id, status, origin_id, destination_id, client, driver_id, truck_id, expected_quantity, expected_arrival
    ) 
    VALUES (
      $1 || '-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('waybill_code_seq')::text, 4, '0'),
      $2, $3, $4, $5, $6, $7, $8, $9
    )
    RETURNING id
  `;
  const values = [code, status, origin_id, destination_id, client, driver_id, truck_id, expected_quantity, expected_arrival];
  const res = await db.query(query, values);
  return res.rows[0];
};

Waybill.getArrivalUnitIds = async (client, waybillId) => {
  const result = await client.query(
    `SELECT DISTINCT unit_id
     FROM waybill_manifest
     WHERE waybill_id = $1 AND manifest_type = 'ARRIVAL'`,
    [waybillId]
  );
  return result.rows.map((r) => r.unit_id);
};
 
Waybill.closeArrivalUnits = async (client, waybillId) => {
  const result = await client.query(
    `UPDATE units
     SET status = 'CLOSED', updated_at = now()
     WHERE id IN (
       SELECT DISTINCT unit_id
       FROM waybill_manifest
       WHERE waybill_id = $1 AND manifest_type = 'ARRIVAL'
     )
     RETURNING id, engine`,
    [waybillId]
  );
  return result.rows;
};

Waybill.insertBulkWaybills = async (data) => {
  const client = await db.connect();
  await checkAndResetSequence();
  try {
    await client.query("BEGIN");
    const query = `
      INSERT INTO waybills (
        id, status, origin_id, destination_id, 
        client, truck_id, driver_id, expected_quantity, expected_arrival
      )
      SELECT 
        d.id || '-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('waybill_code_seq')::text, 4, '0'),
        d.status, d.origin_id, d.destination_id, d.client,
        d.truck_id, d.driver_id, d.expected_quantity, d.expected_arrival
      FROM UNNEST($1::text[], $2::text[], $3::int[], $4::int[], $5::text[], $6::int[], $7::int[], $8::int[], $9::timestamp[]) 
      AS d(id, status, origin_id, destination_id, client, truck_id, driver_id, expected_quantity, expected_arrival)
      RETURNING id;
    `;
    const values = [
      data.map((d) => d.id),
      data.map((d) => d.status),
      data.map((d) => d.origin_id),
      data.map((d) => d.destination_id),
      data.map((d) => d.client),
      data.map((d) => d.truck_id),
      data.map((d) => d.driver_id),
      data.map((d) => d.expected_quantity),
      data.map((d) => d.expected_arrival),
    ];
    await client.query(query, values);
    await client.query("COMMIT");
    return { success: true, count: data.length };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("UNNEST Bulk Insert Failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

Waybill.updateBulkWaybills = async (data) => {
  const client = await db.connect();
  await checkAndResetSequence();
  try {
    await client.query("BEGIN");
    const query = `
      UPDATE waybills AS w
      SET 
        status           = COALESCE(d.status, w.status),
        origin_id        = COALESCE(d.origin_id, w.origin_id),
        destination_id   = COALESCE(d.destination_id, w.destination_id),
        client           = COALESCE(d.client, w.client),
        truck_id         = COALESCE(d.truck_id, w.truck_id),
        driver_id        = COALESCE(d.driver_id, w.driver_id),
        expected_quantity = COALESCE(d.expected_quantity, w.expected_quantity),
        expected_arrival = COALESCE(d.expected_arrival, w.expected_arrival)
      FROM UNNEST(
        $1::text[], $2::text[], $3::int[], $4::int[],
        $5::text[], $6::int[], $7::int[], $8::int[], $9::timestamp[]
      ) AS d(id, status, origin_id, destination_id, client, truck_id, driver_id, expected_quantity, expected_arrival)
      WHERE w.id = d.id
      RETURNING w.id;
    `;
    const values = [
      data.map((d) => d.id),
      data.map((d) => d.status),
      data.map((d) => d.origin_id),
      data.map((d) => d.destination_id),
      data.map((d) => d.client),
      data.map((d) => d.truck_id),
      data.map((d) => d.driver_id),
      data.map((d) => d.expected_quantity),
      data.map((d) => d.expected_arrival),
    ];
    const result = await client.query(query, values);
    await client.query("COMMIT");
    console.log("result.rows: ", result.rows);
    return { success: true, count: data.length };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("UNNEST Bulk Update Failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

Waybill.processBulkManifest = async (waybillId, barcodes, userEmail) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const wbCheck = await client.query(
      "SELECT status FROM waybills WHERE id = $1 FOR UPDATE;",
      [waybillId]
    );

    if (wbCheck.rows.length === 0) throw new Error("Waybill manifest not found.");

    const currentStatus = wbCheck.rows[0].status;
    await client.query(cleanupLoadingQuery);

    if (currentStatus !== "LOADING" && currentStatus !== "UNLOADING") {
      throw new Error(`Cannot finalize manifest. Waybill is currently ${currentStatus}.`);
    }

    const nextStatus   = currentStatus === "LOADING" ? "IN_TRANSIT" : "ARRIVED";
    const manifestType = currentStatus === "LOADING" ? "DEPARTURE"  : "ARRIVAL";

    const updatedWb = await client.query(
      `UPDATE waybills 
       SET status = $2, loading_started_at = NULL 
       WHERE id = $1 
       RETURNING *;`,
      [waybillId, nextStatus]
    );

    for (const barcode of barcodes) {
      await client.query(
        `WITH updated AS (
           UPDATE units 
           SET status = 'IN_TRANSIT'
           WHERE engine = $1 OR frame = $1
           RETURNING id
         )
         INSERT INTO units (engine, status)
         SELECT $1, 'IN_TRANSIT'
         WHERE NOT EXISTS (SELECT 1 FROM updated);`,
        [barcode]
      );

      await client.query(
        `INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type, user_id)
         VALUES (
           $1, 
           (SELECT id FROM units WHERE engine = $2 OR frame = $2 LIMIT 1), 
           $3,
           $4
         );`,
        [waybillId, barcode, manifestType, userEmail]
      );
    }

    await client.query("COMMIT");
    return updatedWb.rows[0];
  } catch (transactionError) {
    await client.query("ROLLBACK");
    throw transactionError;
  } finally {
    client.release();
  }
};

module.exports = Waybill;
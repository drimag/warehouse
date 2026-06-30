const db = require("../config/db");
const {
  checkAndResetSequence,
  cleanupLoadingQuery,
} = require("../utils/waybillUtils");

const Waybill = {
  // Page 3: Display all waybills
  getAllWaybills: async () => {
    const [rows] = await db.execute("SELECT * FROM waybills");
    return rows;
  },

  getAllWaybillCodes: async () => {
    const query = "SELECT id FROM waybills";
    const [rows] = await db.execute(query);
    return rows.map((row) => row.id);
  },

  getWaybillsForScan: async () => {
    await db.execute(cleanupLoadingQuery);

    const query = `
      SELECT w.*
      FROM waybills w
      WHERE w.status = 'IN_TRANSIT' OR w.status = 'ADVICE'
    `;

    const [rows] = await db.execute(query);
    return rows;
  },

  getAllWaybillDisplay: async () => {
    const query = `
      SELECT 
        w.*, 
        -- Location Names
        o.name AS origin,
        d.name AS destination,
        -- Truck and Driver Names
        t.plate_number AS truck,
        dr.full_name AS driver,

        (
          SELECT COUNT(*) 
          FROM waybill_manifest wm 
          WHERE wm.waybill_id = w.id 
          AND (
            (w.status IN ('ADVICE') AND wm.manifest_type = 'ADVICE')
            OR
            (w.status IN ('UNLOADING', 'ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
            OR 
            (w.status IN ('LOADING', 'IN_TRANSIT') AND wm.manifest_type = 'DEPARTURE')
          )
        ) AS actual_qty
      FROM waybills w
      -- Join Locations
      LEFT JOIN locations o ON w.origin_id = o.id
      LEFT JOIN locations d ON w.destination_id = d.id
      -- Join Trucks and Drivers
      LEFT JOIN trucks t ON w.truck_id = t.id
      LEFT JOIN drivers dr ON w.driver_id = dr.id
    `;

    const [res] = await db.execute(query);
    return res;
  },

  getWaybillDisplayById: async (id) => {
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
          OR
          (w.status IN ('ARRIVED', 'CLOSED') AND wm.manifest_type = 'ARRIVAL')
          OR 
          (w.status IN ('IN_TRANSIT', 'LOADING') AND wm.manifest_type = 'DEPARTURE')
        )
      ) AS actual_qty
    FROM waybills w
    LEFT JOIN locations o ON w.origin_id = o.id
    LEFT JOIN locations d ON w.destination_id = d.id
    LEFT JOIN trucks t ON w.truck_id = t.id
    LEFT JOIN drivers dr ON w.driver_id = dr.id
    WHERE w.id = ?
  `;

    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  // Page 4: Display particular waybill + Advice info
  getWaybillInfo: async (id) => {
    const query = `
      SELECT w.*
      FROM waybills w
      WHERE w.id = ?`;
    const res = await db.execute(query, [id]);
    return res.rows[0];
  },

  getWaybillManifestByWBID: async (wbID) => {
    const query = `
      SELECT 
        wm.id,
        wm.waybill_id,
        wm.unit_id,
        u.engine,
        wm.manifest_type,
        wm.user_id,
        wm.created_at
      FROM waybill_manifest wm
      LEFT JOIN units u ON wm.unit_id = u.id
      WHERE wm.waybill_id = ?;
    `;
    const res = await db.execute(query, [wbID]);
    return res.rows || null;
  },

  //TODO: confirm if correct
  getTodayCount: async () => {
    const query = `
      SELECT COUNT(*) as total 
      FROM waybills 
      WHERE DATE(updated_at) = CURRENT_DATE
    `;
    const result = await db.execute(query);
    return parseInt(result.rows[0].total);
  },

  setStatus: async (waybillId, status) => {
    const validStatuses = [
      "ADVICE",
      "LOADING",
      "IN_TRANSIT",
      "UNLOADING",
      "ARRIVED",
      "CLOSED",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const query = `
      UPDATE waybills 
      SET 
        status = ?,
        loading_started_at = CASE 
          WHEN ? = 'LOADING' THEN NOW() 
          ELSE NULL 
        END
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [status, status, waybillId]);

    if (result.affectedRows === 0) {
      throw new Error("Waybill not found");
    }

    return { success: true, id: waybillId, status };
  },

  touchLoadingTimeout: async (waybillId) => {
    const cleanUp = await db.execute(cleanupLoadingQuery);

    const query = `
      UPDATE waybills 
      SET loading_started_at = NOW()
      WHERE id = ? AND status IN ('LOADING', 'UNLOADING');
    `;

    const [result] = await db.execute(query, [waybillId]);

    if (result.affectedRows === 0) {
      throw new Error("Waybill not found");
    }

    return { success: true, id: waybillId, status };
  },

  insertFromForm: async (data) => {
    const {
      code,
      status,
      origin_id,
      destination_id,
      client,
      driver_id,
      truck_id,
      expected_quantity,
      expected_arrival,
    } = data;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Generate the waybill code
      const waybillCode = await generateWaybillCode(code);

      const query = `
      INSERT INTO waybills (
        id, status, origin_id, destination_id, client, driver_id, truck_id, expected_quantity, expected_arrival
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
        waybillCode,
        status,
        origin_id,
        destination_id,
        client,
        driver_id,
        truck_id,
        expected_quantity,
        expected_arrival,
      ];

      const [result] = await connection.execute(query, values);

      await connection.commit();

      // Fetch and return the inserted waybill
      const [inserted] = await connection.execute(
        "SELECT * FROM waybills WHERE id = ?",
        [waybillCode],
      );

      return inserted[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  insertBulkWaybills: async (data) => {
    const connection = await db.getConnection();
    await checkAndResetSequence();

    try {
      await connection.beginTransaction();

      const insertedIds = [];

      for (const item of data) {
        // Generate waybill code for each item
        const waybillCode = await generateWaybillCode(item.id);

        const query = `
        INSERT INTO waybills (
          id, status, origin_id, destination_id, 
          client, truck_id, driver_id, expected_quantity, expected_arrival
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const values = [
          waybillCode,
          item.status,
          item.origin_id,
          item.destination_id,
          item.client,
          item.truck_id,
          item.driver_id,
          item.expected_quantity,
          item.expected_arrival,
        ];

        const [result] = await connection.execute(query, values);
        insertedIds.push(waybillCode);
      }

      await connection.commit();
      return { success: true, count: data.length, ids: insertedIds };
    } catch (error) {
      await connection.rollback();
      console.error("Bulk Insert Failed:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  updateBulkWaybills: async (data) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // MySQL doesn't have UNNEST, so loop through data
      for (const item of data) {
        const query = `
        UPDATE waybills
        SET 
          status = COALESCE(?, status),
          origin_id = COALESCE(?, origin_id),
          destination_id = COALESCE(?, destination_id),
          client = COALESCE(?, client),
          truck_id = COALESCE(?, truck_id),
          driver_id = COALESCE(?, driver_id),
          expected_quantity = COALESCE(?, expected_quantity),
          expected_arrival = COALESCE(?, expected_arrival)
        WHERE id = ?
      `;

        const values = [
          item.status,
          item.origin_id,
          item.destination_id,
          item.client,
          item.truck_id,
          item.driver_id,
          item.expected_quantity,
          item.expected_arrival,
          item.id,
        ];

        await connection.execute(query, values);
      }

      await connection.commit();
      return { success: true, count: data.length };
    } catch (error) {
      await connection.rollback();
      console.error("Bulk Update Failed:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  processBulkManifest: async (waybillId, barcodes) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // MySQL row locking - similar to FOR UPDATE
      const [wbCheck] = await connection.execute(
        "SELECT status FROM waybills WHERE id = ? FOR UPDATE",
        [waybillId],
      );

      if (wbCheck.length === 0) {
        throw new Error("Waybill manifest not found.");
      }

      const currentStatus = wbCheck[0].status;

      await connection.execute(cleanupLoadingQuery);

      if (currentStatus !== "LOADING" && currentStatus !== "UNLOADING") {
        throw new Error(
          `Cannot finalize manifest. Waybill is currently ${currentStatus}.`,
        );
      }

      const nextStatus = currentStatus === "LOADING" ? "IN_TRANSIT" : "ARRIVED";
      const manifestType =
        currentStatus === "LOADING" ? "DEPARTURE" : "ARRIVAL";

      // Update waybill and get result
      const [updateResult] = await connection.execute(
        `UPDATE waybills 
       SET status = ?, loading_started_at = NULL 
       WHERE id = ?`,
        [nextStatus, waybillId],
      );

      // Now fetch the updated waybill
      const [updatedWb] = await connection.execute(
        "SELECT * FROM waybills WHERE id = ?",
        [waybillId],
      );

      // Process each barcode
      for (const barcode of barcodes) {
        // Step 1: Try to update existing unit
        const [updateCheck] = await connection.execute(
          "UPDATE units SET status = ? WHERE engine = ? OR frame = ?",
          ["IN_TRANSIT", barcode, barcode],
        );

        // Step 2: If no rows were updated, insert new unit
        if (updateCheck.affectedRows === 0) {
          await connection.execute(
            "INSERT INTO units (engine, status) VALUES (?, ?)",
            [barcode, "IN_TRANSIT"],
          );
        }

        // Step 3: Get the unit ID
        const [unitRows] = await connection.execute(
          "SELECT id FROM units WHERE engine = ? OR frame = ? LIMIT 1",
          [barcode, barcode],
        );

        if (unitRows.length > 0) {
          const unitId = unitRows[0].id;

          // Step 4: Insert into waybill_manifest
          await connection.execute(
            `INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type)
           VALUES (?, ?, ?)`,
            [waybillId, unitId, manifestType],
          );
        }
      }

      await connection.commit();
      return updatedWb[0];
    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }
  },
};

module.exports = Waybill;

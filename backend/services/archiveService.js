const ExcelJS = require("exceljs");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const db = require("../config/db");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------------------------------------------------------------------
// STEP 1: Fetch all CLOSED waybills older than 1 week + their manifests
// ---------------------------------------------------------------------------
const fetchArchivableData = async (client) => {
  const waybillResult = await client.query(`
    SELECT
      w.id,
      w.status,
      w.client,
      w.expected_quantity,
      w.expected_arrival,
      w.departure_photo_url,
      w.arrival_photo_url,
      w.updated_at,
      ol.name AS origin,
      dl.name AS destination,
      t.plate_number AS truck,
      d.full_name AS driver
    FROM waybills w
    LEFT JOIN locations ol ON w.origin_id = ol.id
    LEFT JOIN locations dl ON w.destination_id = dl.id
    LEFT JOIN trucks t ON w.truck_id = t.id
    LEFT JOIN drivers d ON w.driver_id = d.id
    WHERE w.status = 'CLOSED'
      AND w.updated_at < now()
      -- AND w.updated_at < now() - INTERVAL '1 week'
    ORDER BY w.updated_at ASC;
  `);

  if (waybillResult.rows.length === 0) return null; // Nothing to archive

  const waybillIds = waybillResult.rows.map((w) => w.id);

  const manifestResult = await client.query(`
    SELECT
      wm.waybill_id,
      wm.manifest_type,
      wm.user_id,
      wm.created_at,
      u.engine,
      u.frame,
      u.model,
      u.status AS unit_status
    FROM waybill_manifest wm
    LEFT JOIN units u ON wm.unit_id = u.id
    WHERE wm.waybill_id = ANY($1)
    ORDER BY wm.waybill_id, wm.created_at ASC;
  `, [waybillIds]);

  return {
    waybills: waybillResult.rows,
    manifests: manifestResult.rows,
    waybillIds,
  };
};

// ---------------------------------------------------------------------------
// STEP 2: Build the Excel workbook in memory
// ---------------------------------------------------------------------------
const buildExcelBuffer = async (waybills, manifests, dateLabel) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ILA Warehouse System";
  workbook.created = new Date();

  // --- Header style ---
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    },
  };

  // ── Sheet 1: Waybills ──────────────────────────────────────────────────────
  const waybillSheet = workbook.addWorksheet("Waybills");

  waybillSheet.columns = [
    { header: "Waybill ID",        key: "id",                width: 20 },
    { header: "Status",            key: "status",            width: 14 },
    { header: "Client",            key: "client",            width: 18 },
    { header: "Origin",            key: "origin",            width: 14 },
    { header: "Destination",       key: "destination",       width: 14 },
    { header: "Truck",             key: "truck",             width: 14 },
    { header: "Driver",            key: "driver",            width: 20 },
    { header: "Expected Qty",      key: "expected_quantity", width: 14 },
    { header: "Expected Arrival",  key: "expected_arrival",  width: 22 },
    { header: "Departure Photo",   key: "departure_photo_url", width: 40 },
    { header: "Arrival Photo",     key: "arrival_photo_url", width: 40 },
    { header: "Closed At",         key: "updated_at",        width: 22 },
  ];

  waybillSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));
  waybillSheet.getRow(1).height = 20;

  waybills.forEach((wb) => {
    waybillSheet.addRow({
      ...wb,
      expected_arrival: wb.expected_arrival
        ? new Date(wb.expected_arrival).toLocaleString()
        : "—",
      updated_at: new Date(wb.updated_at).toLocaleString(),
    });
  });

  // Alternating row shading
  waybillSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4FA" } };
      });
    }
  });

  // ── Sheet 2: Manifests ────────────────────────────────────────────────────
  const manifestSheet = workbook.addWorksheet("Manifests");

  manifestSheet.columns = [
    { header: "Waybill ID",     key: "waybill_id",     width: 20 },
    { header: "Engine",         key: "engine",         width: 16 },
    { header: "Frame",          key: "frame",          width: 16 },
    { header: "Model",          key: "model",          width: 14 },
    { header: "Unit Status",    key: "unit_status",    width: 14 },
    { header: "Manifest Type",  key: "manifest_type",  width: 16 },
    { header: "Scanned By",     key: "user_id",        width: 24 },
    { header: "Created At",     key: "created_at",     width: 22 },
  ];

  manifestSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));
  manifestSheet.getRow(1).height = 20;

  manifests.forEach((m) => {
    manifestSheet.addRow({
      ...m,
      created_at: new Date(m.created_at).toLocaleString(),
    });
  });

  manifestSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4FA" } };
      });
    }
  });

  // Return as buffer for Cloudinary upload
  return await workbook.xlsx.writeBuffer();
};

// ---------------------------------------------------------------------------
// STEP 3: Upload the Excel buffer to Cloudinary as a raw file
// ---------------------------------------------------------------------------
const uploadToCloudinary = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",        // Required for non-image files
        folder: "ila-warehouse/archives",
        public_id: fileName,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    // Pipe the buffer into the upload stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// ---------------------------------------------------------------------------
// STEP 4: Delete archived records from the DB in safe FK order
// ---------------------------------------------------------------------------
const deleteArchivedRecords = async (client, waybillIds) => {
  // 1. Grab unit IDs involved in these waybills before deleting manifests
  const unitResult = await client.query(`
    SELECT DISTINCT unit_id FROM waybill_manifest
    WHERE waybill_id = ANY($1);
  `, [waybillIds]);

  const unitIds = unitResult.rows.map((r) => r.unit_id);

  // 2. Delete manifests (references both waybills and units)
  await client.query(`
    DELETE FROM waybill_manifest WHERE waybill_id = ANY($1);
  `, [waybillIds]);

  // 3. Delete waybill history rows
  await client.query(`
    DELETE FROM waybill_history WHERE waybill_id = ANY($1);
  `, [waybillIds]);

  // 4. Delete waybills
  await client.query(`
    DELETE FROM waybills WHERE id = ANY($1);
  `, [waybillIds]);

  // 5. Delete units that are CLOSED and have no remaining manifest rows
  //    (units that appeared on other non-archived waybills are kept)
  if (unitIds.length > 0) {
    await client.query(`
      DELETE FROM units
      WHERE id = ANY($1)
        AND status = 'CLOSED'
        AND NOT EXISTS (
          SELECT 1 FROM waybill_manifest wm WHERE wm.unit_id = units.id
        );
    `, [unitIds]);
  }
};

// ---------------------------------------------------------------------------
// MAIN: runArchive — orchestrates all steps inside a transaction
// ---------------------------------------------------------------------------
const runArchive = async (triggeredBy = "system") => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Step 1: Fetch
    const data = await fetchArchivableData(client);
    if (!data) {
      await client.query("ROLLBACK");
      return { skipped: true, message: "No waybills eligible for archiving." };
    }

    const { waybills, manifests, waybillIds } = data;

    // Step 2: Build Excel
    const dateLabel = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fileName = `archive_${dateLabel}`;
    const buffer = await buildExcelBuffer(waybills, manifests, dateLabel);

    // Step 3: Upload to Cloudinary (outside transaction — can't roll back uploads)
    // If this fails, the transaction is rolled back and DB is untouched
    const fileUrl = await uploadToCloudinary(buffer, fileName);

    // Step 4: Delete records
    await deleteArchivedRecords(client, waybillIds);

    // Step 5: Save archive record
    const oldest = waybills[0].updated_at;
    const newest = waybills[waybills.length - 1].updated_at;

    await client.query(`
      INSERT INTO archives (created_by, file_url, file_name, waybill_count, date_from, date_to)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [triggeredBy, fileUrl, `${fileName}.xlsx`, waybills.length, oldest, newest]);

    await client.query("COMMIT");

    return {
      skipped: false,
      waybillCount: waybills.length,
      fileName: `${fileName}.xlsx`,
      fileUrl,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { runArchive };

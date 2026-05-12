const ExcelJS = require("exceljs");
const Unit = require("../models/unitModel");
const Waybill = require("../models/waybillModel");

const REQUIRED_WAYBILL_HEADERS = [
  "id",
  "status",
  "origin_id",
  "destination_id",
  "client",
  "truck_id",
  "driver_id",
  "expected_quantity",
  "expected_arrival",
];

const REQUIRED_UNIT_HEADERS = [
  "engine",
  "frame",
  "model",
  "color",
  "status",
  "da",
  "last_location_id",
  "waybill_code",
];

const processWaybills = async (data) => {
  const waybillsToInsert = data.map((row, index) => ({
    id: row.id || "WB",
    status: row.status,
    origin_id: row.origin_id,
    destination_id: row.destination_id,
    client: row.client,
    truck_id: row.truck_id,
    driver_id: row.driver_id,
    expected_quantity: row.expected_quantity,
    expected_arrival: row.expected_arrival,
  }));

  const result = await Waybill.insertBulkWaybills(waybillsToInsert);

  return {
    totalProcessed: data.length,
    successCount: result.length,
    failedOrDuplicate: data.length - result.length,
  };
};

const processUnits = async (data) => {
  const formattedData = data.map((row) => ({
    engine: row.engine,
    frame: row.frame,
    model: row.model,
    color: row.color,
    status: row.status || 'IN_STORAGE', // TODO: clarify if default should be disallowed
    da: row.da,
    last_location_id: parseInt(row.last_location_id),
    waybill_code: row.waybill_code, 
  }));

  return await Unit.insertBulkUnits(formattedData);
};

exports.bulkUploadSheet = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Check the field name." });
  }
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1); // Get first sheet

    const data = [];
    // workbook to JSON mapping
    const headers = worksheet
      .getRow(1)
      .values.map((v) => v?.toString().toLowerCase().trim());

    console.log("headers: ",headers);

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowData = {};
      row.values.forEach((value, index) => {
        const header = headers[index];
        if (header) rowData[header] = value;
      });
      data.push(rowData);
    });

    const isWaybillSheet = REQUIRED_WAYBILL_HEADERS.every((header) =>
      headers.includes(header),
    );

    const isUnitSheet = REQUIRED_UNIT_HEADERS.every((header) =>
      headers.includes(header),
    );

    if (isWaybillSheet) {
      const result = await processWaybills(data);
      return res.status(200).json({ type: "WAYBILLS", ...result });
    }

    if (isUnitSheet) {
      const result = await processUnits(data);
      return res.status(200).json({ type: "UNITS", ...result });
    }

    return res
      .status(400)
      .json({ error: "Columns do not match Waybill or Unit templates." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error during bulk processing" });
  }
};

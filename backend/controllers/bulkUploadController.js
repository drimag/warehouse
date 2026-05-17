const ExcelJS = require("exceljs");
const Unit = require("../models/unitModel");
const Waybill = require("../models/waybillModel");
const ReferenceModel = require("../models/referenceModel");

const REQUIRED_WAYBILL_HEADERS = [
  "code",
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
  const VALID_STATUSES = ["ADVICE", "IN_TRANSIT", "ARRIVED", "CLOSED"];
  const errors = [];

  data.forEach((row, index) => {
    const rowErrors = [];
    const rowNum = index + 1;

    const status = row.status?.toString().trim().toUpperCase();
    if (!VALID_STATUSES.includes(status)) {
      rowErrors.push(`Invalid status: "${row.status}"`);
    }

    if (!row.origin_id || isNaN(row.origin_id))
      rowErrors.push("Origin ID must be a number");
    if (!row.destination_id || isNaN(row.destination_id))
      rowErrors.push("Destination ID must be a number");
    if (!row.truck_id || isNaN(row.truck_id))
      rowErrors.push("Truck ID must be a number");
    if (!row.driver_id || isNaN(row.driver_id))
      rowErrors.push("Driver ID must be a number");

    const qty = parseInt(row.expected_quantity);
    if (isNaN(qty) || qty < 0 || qty > 9999) {
      rowErrors.push(`Quantity must be 0-9999 (got: ${row.expected_quantity})`);
    }

    if (!row.expected_arrival || isNaN(Date.parse(row.expected_arrival))) {
      rowErrors.push(`Invalid date: "${row.expected_arrival}"`);
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: rowNum,
        identifier: row.id || `Row ${rowNum}`,
        details: rowErrors,
      });
    }
  });

  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }

  const waybillsToInsert = data.map((row) => ({
    id: row.id || "WB",
    status: row.status.toUpperCase(),
    origin_id: parseInt(row.origin_id),
    destination_id: parseInt(row.destination_id),
    client: row.client,
    truck_id: parseInt(row.truck_id),
    driver_id: parseInt(row.driver_id),
    expected_quantity: parseInt(row.expected_quantity),
    expected_arrival: new Date(row.expected_arrival).toISOString(),
  }));

  const result = await Waybill.insertBulkWaybills(waybillsToInsert);

  return {
    totalProcessed: data.length,
    successCount: result.length,
    failedOrDuplicate: data.length - result.length,
    type: "Waybill",
  };
};

const processUnits = async (data, validMetadata) => {
  const VALID_STATUSES = ["IN_TRANSIT", "IN_STORAGE"];
  const errors = [];
  const formattedData = [];

  data.forEach((row, index) => {
    const rowNumber = index + 1;
    const rowErrors = [];

    // 1. Engine & Frame Null Check
    if (!row.engine || row.engine.toString().trim() === "") {
      rowErrors.push("Engine number is required");
    }
    if (!row.frame || row.frame.toString().trim() === "") {
      rowErrors.push("Frame number is required");
    }

    // 2. Status Validation
    const currentStatus = row.status?.toString().trim().toUpperCase();
    if (!VALID_STATUSES.includes(currentStatus)) {
      rowErrors.push(
        `Invalid status: "${row.status}". Must be ${VALID_STATUSES.join(", ")}`,
      );
    }

    // 3. Location ID Validation (Check if it's a number AND exists in DB)
    const locId = parseInt(row.last_location_id);
    if (isNaN(locId)) {
      rowErrors.push(
        `Location ID must be a number (got: "${row.last_location_id}")`,
      );
    } else if (
      validMetadata.locationIds &&
      !validMetadata.locationIds.includes(locId)
    ) {
      rowErrors.push(`Location ID ${locId} does not exist in the database`);
    }

    // 4. Waybill Code Existence Check
    if (row.waybill_code && validMetadata.waybillCodes) {
      if (
        !validMetadata.waybillCodes.includes(row.waybill_code.toString().trim())
      ) {
        rowErrors.push(
          `Waybill Code "${row.waybill_code}" not found in database`,
        );
      }
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        engine: row.engine || "N/A",
        details: rowErrors,
      });
    } else {
      formattedData.push({
        engine: row.engine.toString().trim(),
        frame: row.frame.toString().trim(),
        model: row.model,
        color: row.color,
        status: currentStatus,
        da: row.da,
        last_location_id: locId,
        waybill_code: row.waybill_code?.toString().trim(),
      });
    }
  });

  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }

  return await Unit.insertBulkUnits(formattedData);
};

exports.bulkUploadSheet = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded. Check the field name." });
  }
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1); // Get first sheet

    const [locationIds, waybillCodes] = await Promise.all([
      ReferenceModel.getAllLocationIds(),
      Waybill.getAllWaybillCodes(),
    ]);

    const validMetadata = { locationIds, waybillCodes };

    const data = [];
    // workbook to JSON mapping
    const headers = worksheet
      .getRow(1)
      .values.map((v) => v?.toString().toLowerCase().trim());

    console.log("headers: ", headers);

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
      const result = await processUnits(data, validMetadata);
      return res.status(200).json({ type: "UNITS", ...result });
    }

    return res
      .status(400)
      .json({ error: "Columns do not match Waybill or Unit templates." });
  } catch (err) {
    console.error(err);

    if (err.validationErrors) {
      return res.status(422).json({
        message: "Multiple validation errors found in the file.",
        errors: err.validationErrors,
      });
    }

    res
      .status(500)
      .json({ error: "Internal Server Error during bulk processing" });
  }
};

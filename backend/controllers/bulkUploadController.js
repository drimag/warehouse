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

const REQUIRED_WAYBILL_UPDATE_HEADERS = [
  "current_id",
  "new_status",
  "new_origin_id",
  "new_destination_id",
  "new_client",
  "new_truck_id",
  "new_driver_id",
  "new_expected_quantity",
  "new_expected_arrival",
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

const REQUIRED_UNIT_UPDATE_HEADERS = [
  "old_engine",
  "new_engine",
  "new_frame",
  "new_model",
  "new_color",
  "new_status",
  "new_da",
  "new_last_location_id",
  "new_waybill_code",
];

const validateNewWaybillRow = (row, index) => {
  const VALID_STATUSES = ["ADVICE", "IN_TRANSIT", "ARRIVED", "CLOSED"];
  const rowErrors = [];
  const rowNum = index + 1;

  const hasValue = (val) =>
    val !== undefined && val !== null && val.toString().trim() !== "";

  if (!hasValue(row.code)) {
    rowErrors.push("Missing required field: 'code'");
  } else {
    const cleanCode = row.code.toString().trim();

    if (cleanCode.length < 2 || cleanCode.length > 6) {
      rowErrors.push(
        `Code prefix "${row.code}" must be between 2 and 6 characters.`,
      );
    }

    const alphanumericRegex = /^[A-Za-z0-9]+$/;
    if (!alphanumericRegex.test(cleanCode)) {
      rowErrors.push(
        `Code prefix "${row.code}" must contain only letters and numbers (no spaces or symbols).`,
      );
    }
  }

  if (
    !hasValue(row.status) ||
    !VALID_STATUSES.includes(row.status.toString().trim().toUpperCase())
  ) {
    rowErrors.push(`Invalid or missing status: "${row.status}"`);
  }

  ["origin_id", "destination_id", "truck_id", "driver_id"].forEach((field) => {
    if (!hasValue(row[field]) || isNaN(row[field])) {
      rowErrors.push(`Valid numeric '${field}' is required`);
    }
  });

  const qty = parseInt(row.expected_quantity);
  if (isNaN(qty) || qty < 0 || qty > 9999) {
    rowErrors.push(`Quantity must be 0-9999 (got: ${row.expected_quantity})`);
  }

  if (
    !hasValue(row.expected_arrival) ||
    isNaN(Date.parse(row.expected_arrival))
  ) {
    rowErrors.push(`Invalid arrival date: "${row.expected_arrival}"`);
  }

  return rowErrors.length > 0
    ? {
        row: rowNum,
        identifier: row.code || `Row ${rowNum}`,
        details: rowErrors,
      }
    : null;
};

const processNewWaybills = async (data) => {
  const errors = data
    .map((row, idx) => validateNewWaybillRow(row, idx))
    .filter(Boolean);
  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }

  const formattedData = data.map((row) => ({
    id: row.code,
    status: row.status.toString().trim().toUpperCase(),
    origin_id: parseInt(row.origin_id),
    destination_id: parseInt(row.destination_id),
    client: row.client || null,
    truck_id: parseInt(row.truck_id),
    driver_id: parseInt(row.driver_id),
    expected_quantity: parseInt(row.expected_quantity),
    expected_arrival: new Date(row.expected_arrival).toISOString(),
  }));

  const result = await Waybill.insertBulkWaybills(formattedData);

  return {
    isSuccess: result.success,
    count: result.count,
    type: "Waybill Creation",
  };
};

const validateUpdateWaybillRow = (row, index, validMetadata) => {
  const VALID_STATUSES = ["ADVICE", "IN_TRANSIT", "ARRIVED", "CLOSED"];
  const rowErrors = [];
  const rowNum = index + 1;

  const hasValue = (val) =>
    val !== undefined && val !== null && val.toString().trim() !== "";

  if (!hasValue(row.current_id)) {
    rowErrors.push(
      "Missing key tracking constraint: 'current_id' column must contain data",
    );
  } else {
    const currentWBID = row.current_id.toString().trim();
    if (
      validMetadata?.waybillCodes &&
      !validMetadata.waybillCodes.includes(currentWBID)
    ) {
      rowErrors.push(
        `WB with code: "${currentWBID}" does not exist in the database`,
      );
    }
  }

  if (
    hasValue(row.new_status) &&
    !VALID_STATUSES.includes(row.new_status.toString().trim().toUpperCase())
  ) {
    rowErrors.push(`Invalid status variant provided: "${row.new_status}"`);
  }

  [
    "new_origin_id",
    "new_destination_id",
    "new_truck_id",
    "new_driver_id",
  ].forEach((field) => {
    if (hasValue(row[field]) && isNaN(row[field])) {
      rowErrors.push(
        `Optional override content field '${field}' must be numeric`,
      );
    }
  });

  if (hasValue(row.new_expected_quantity)) {
    const qty = parseInt(row.new_expected_quantity);
    if (isNaN(qty) || qty < 0 || qty > 9999) {
      rowErrors.push(
        `Override entry volume must sit between 0-9999 (got: ${row.new_expected_quantity})`,
      );
    }
  }

  if (
    hasValue(row.new_expected_arrival) &&
    isNaN(Date.parse(row.new_expected_arrival))
  ) {
    rowErrors.push(
      `Malformed date stamp string block discovered: "${row.new_expected_arrival}"`,
    );
  }

  return rowErrors.length > 0
    ? {
        row: rowNum,
        identifier: row.current_id || `Row ${rowNum}`,
        details: rowErrors,
      }
    : null;
};

const processUpdateWaybills = async (data, validMetadata) => {
  const errors = data
    .map((row, idx) => validateUpdateWaybillRow(row, idx, validMetadata))
    .filter(Boolean);
  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }

  const safeField = (val, formatter = (v) => v) => {
    if (val === undefined || val === null || val.toString().trim() === "")
      return null;
    return formatter(val);
  };

  const formattedData = data.map((row) => ({
    id: row.current_id,
    status: safeField(row.new_status, (v) => v.toString().toUpperCase()),
    origin_id: safeField(row.new_origin_id, parseInt),
    destination_id: safeField(row.new_destination_id, parseInt),
    client: safeField(row.new_client),
    truck_id: safeField(row.new_truck_id, parseInt),
    driver_id: safeField(row.new_driver_id, parseInt),
    expected_quantity: safeField(row.new_expected_quantity, parseInt),
    expected_arrival: safeField(row.new_expected_arrival, (v) =>
      new Date(v).toISOString(),
    ),
  }));

  const result = await Waybill.updateBulkWaybills(formattedData);

  return {
    isSuccess: result.success,
    count: result.count,
    type: "Waybill Update",
  };
};

const validateNewUnitRow = (row, index, validMetadata) => {
  const VALID_STATUSES = ["IN_TRANSIT", "IN_STORAGE", "CLOSED"];
  const rowErrors = [];
  const rowNum = index + 1;

  const hasValue = (val) =>
    val !== undefined && val !== null && val.toString().trim() !== "";

  if (!hasValue(row.engine)) {
    rowErrors.push("Engine number is required");
  } else if (row.engine.toLowerCase() === row.frame.toLowerCase()) {
    rowErrors.push("Engine number and Frame number cannot be identical.");
  }

  const currentStatus = row.status?.toString().trim().toUpperCase();
  if (!VALID_STATUSES.includes(currentStatus)) {
    rowErrors.push(
      `Invalid status: "${row.status}". Must be ${VALID_STATUSES.join(", ")}`,
    );
  }

  if (
    validMetadata?.engines &&
    validMetadata.engines.includes(row.engine.toString().trim())
  ) {
    rowErrors.push(
      `Engine number "${row.engine}" already exists in the database`,
    );
  }

  // 3. Location verification using database metadata
  const locId = parseInt(row.last_location_id);
  if (isNaN(locId)) {
    rowErrors.push(
      `Location ID must be a number (got: "${row.last_location_id}")`,
    );
  } else if (
    validMetadata?.locationIds &&
    !validMetadata.locationIds.includes(locId)
  ) {
    rowErrors.push(`Location ID ${locId} does not exist in the database`);
  }

  // 4. Waybill verification using database metadata
  if (validMetadata?.waybillCodes) {
    const cleanCode = row.waybill_code.toString().trim();
    if (!validMetadata.waybillCodes.includes(cleanCode)) {
      rowErrors.push(
        `Waybill Code "${row.waybill_code}" not found in database`,
      );
    }
  }

  return rowErrors.length > 0
    ? { row: rowNum, engine: row.engine || "N/A", details: rowErrors }
    : null;
};
const processNewUnits = async (data, validMetadata, userId) => {
  const errors = data
    .map((row, idx) => validateNewUnitRow(row, idx, validMetadata))
    .filter(Boolean);
  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }

  const formattedData = data.map((row) => ({
    engine: row.engine.toString().trim(),
    frame: row.frame.toString().trim(),
    model: row.model ? row.model.toString().trim() : null,
    color: row.color ? row.color.toString().trim() : null,
    status: row.status.toString().trim().toUpperCase(),
    da: row.da ? row.da.toString().trim() : null,
    last_location_id: parseInt(row.last_location_id),
    waybill_code: row.waybill_code.toString().trim(),
  }));

  const result = await Unit.insertBulkUnits(formattedData, userId);

  return {
    isSuccess: result.success,
    count: result.count,
    type: "Unit Creation",
  };
};

const validateUpdateUnitRow = (row, index, validMetadata) => {
  const VALID_STATUSES = ["IN_TRANSIT", "IN_STORAGE", "CLOSED"];
  const rowErrors = [];
  const rowNum = index + 1;

  const hasValue = (val) =>
    val !== undefined && val !== null && val.toString().trim() !== "";

  // 1. Core tracking constraint check
  if (!hasValue(row.old_engine)) {
    rowErrors.push(
      "Missing key tracking constraint: 'old_engine' column must contain data",
    );
  } else {
    const cleanEngine = row.old_engine.toString().trim();
    if (
      validMetadata?.engines &&
      !validMetadata.engines.includes(cleanEngine)
    ) {
      rowErrors.push(
        `Old Engine number "${cleanEngine}" does not exist in database`,
      );
    }
  }

  const cleanEngine = row.new_engine.toString().trim();
  if (validMetadata?.engines && validMetadata.engines.includes(cleanEngine)) {
    rowErrors.push(
      `Engine number "${cleanEngine}" already exists in the database`,
    );
  }

  // 2. Optional status check
  if (hasValue(row.new_status)) {
    const currentStatus = row.new_status.toString().trim().toUpperCase();
    if (!VALID_STATUSES.includes(currentStatus)) {
      rowErrors.push(
        `Invalid status: "${row.new_status}". Must be ${VALID_STATUSES.join(", ")}`,
      );
    }
  }

  // 3. Optional location metadata check
  if (hasValue(row.new_last_location_id)) {
    const locId = parseInt(row.new_last_location_id);
    if (isNaN(locId)) {
      rowErrors.push(
        `Location ID must be a number (got: "${row.new_last_location_id}")`,
      );
    } else if (
      validMetadata?.locationIds &&
      !validMetadata.locationIds.includes(locId)
    ) {
      rowErrors.push(`Location ID ${locId} does not exist in the database`);
    }
  }

  // 4. Optional waybill metadata check
  if (hasValue(row.new_waybill_code) && validMetadata?.waybillCodes) {
    const cleanCode = row.new_waybill_code.toString().trim();
    if (!validMetadata.waybillCodes.includes(cleanCode)) {
      rowErrors.push(
        `Waybill Code "${row.new_waybill_code}" not found in database`,
      );
    }
  }

  return rowErrors.length > 0
    ? { row: rowNum, engine: row.old_engine || "N/A", details: rowErrors }
    : null;
};

const processUpdateUnits = async (data, validMetadata, userId) => {
  const errors = data
    .map((row, idx) => validateUpdateUnitRow(row, idx, validMetadata))
    .filter(Boolean);
  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }

  const safeField = (val, formatter = (v) => v) => {
    if (val === undefined || val === null || val.toString().trim() === "")
      return null;
    return formatter(val);
  };

  const formattedData = data.map((row) => ({
    old_engine: row.old_engine.toString().trim(),
    new_engine: safeField(row.new_engine),
    new_frame: safeField(row.new_frame),
    new_model: safeField(row.new_model),
    new_color: safeField(row.new_color),
    new_status: safeField(row.new_status, (v) => v.toString().toUpperCase()),
    new_da: safeField(row.new_da),
    new_last_location_id: safeField(row.new_last_location_id, parseInt),
    new_waybill_code: safeField(row.new_waybill_code),
  }));

  const result = await Unit.updateBulkUnits(formattedData, userId);

  return {
    isSuccess: result.success,
    count: result.count,
    type: "Unit Update",
  };
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
    const worksheet = workbook.getWorksheet(1);

    const [locationIds, waybillCodes, engines] = await Promise.all([
      ReferenceModel.getAllLocationIds(),
      Waybill.getAllWaybillCodes(),
      Unit.getAllEngines(),
    ]);

    const validMetadata = { locationIds, waybillCodes, engines };

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

    const isWaybillUpdateSheet = REQUIRED_WAYBILL_UPDATE_HEADERS.every(
      (header) => headers.includes(header),
    );

    const isUnitUpdateSheet = REQUIRED_UNIT_UPDATE_HEADERS.every((header) =>
      headers.includes(header),
    );

    if (isWaybillSheet) {
      const result = await processNewWaybills(data, validMetadata);
      return res.status(200).json({ type: "WAYBILLS", ...result });
    }

    if (isWaybillUpdateSheet) {
      const result = await processUpdateWaybills(data, validMetadata);
      return res.status(200).json({ type: "WAYBILLS", ...result });
    }

    if (isUnitSheet) {
      const result = await processNewUnits(data, validMetadata);
      return res.status(200).json({ type: "UNITS", ...result });
    }

    if (isUnitUpdateSheet) {
      const result = await processUpdateUnits(data, validMetadata);
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

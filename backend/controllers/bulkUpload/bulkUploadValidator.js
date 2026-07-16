const {
  VALID_WAYBILL_STATUSES,
  VALID_UNIT_STATUSES,
} = require("./bulkUploadConstants");

// ─── Shared Helpers ───────────────────────────────────────────────────────────

const hasValue = (val) =>
  val !== undefined && val !== null && val.toString().trim() !== "";

const throwIfErrors = (errors) => {
  if (errors.length > 0) {
    const errorBody = new Error("Validation Failed");
    errorBody.validationErrors = errors;
    throw errorBody;
  }
};

// ─── Waybill Validators ───────────────────────────────────────────────────────

const validateNewWaybillRow = (row, index) => {
  const rowErrors = [];
  const rowNum = index + 1;

  if (!hasValue(row.code)) {
    rowErrors.push("Missing required field: 'code'");
  } else {
    const cleanCode = row.code.toString().trim();
    if (cleanCode.length < 2 || cleanCode.length > 6) {
      rowErrors.push(
        `Code prefix "${row.code}" must be between 2 and 6 characters.`
      );
    }
    if (!/^[A-Za-z0-9]+$/.test(cleanCode)) {
      rowErrors.push(
        `Code prefix "${row.code}" must contain only letters and numbers (no spaces or symbols).`
      );
    }
  }

  if (
    !hasValue(row.status) ||
    !VALID_WAYBILL_STATUSES.includes(row.status.toString().trim().toUpperCase())
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

  if (!hasValue(row.expected_arrival) || isNaN(Date.parse(row.expected_arrival))) {
    rowErrors.push(`Invalid arrival date: "${row.expected_arrival}"`);
  }

  return rowErrors.length > 0
    ? { row: rowNum, identifier: row.code || `Row ${rowNum}`, details: rowErrors }
    : null;
};

const validateUpdateWaybillRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;

  if (!hasValue(row.current_id)) {
    rowErrors.push(
      "Missing key tracking constraint: 'current_id' column must contain data"
    );
  } else {
    const currentWBID = row.current_id.toString().trim();
    if (validMetadata?.waybillCodes && !validMetadata.waybillCodes.includes(currentWBID)) {
      rowErrors.push(`WB with code: "${currentWBID}" does not exist in the database`);
    }
  }

  if (
    hasValue(row.new_status) &&
    !VALID_WAYBILL_STATUSES.includes(row.new_status.toString().trim().toUpperCase())
  ) {
    rowErrors.push(`Invalid status variant provided: "${row.new_status}"`);
  }

  ["new_origin_id", "new_destination_id", "new_truck_id", "new_driver_id"].forEach(
    (field) => {
      if (hasValue(row[field]) && isNaN(row[field])) {
        rowErrors.push(`Optional override content field '${field}' must be numeric`);
      }
    }
  );

  if (hasValue(row.new_expected_quantity)) {
    const qty = parseInt(row.new_expected_quantity);
    if (isNaN(qty) || qty < 0 || qty > 9999) {
      rowErrors.push(
        `Override entry volume must sit between 0-9999 (got: ${row.new_expected_quantity})`
      );
    }
  }

  if (hasValue(row.new_expected_arrival) && isNaN(Date.parse(row.new_expected_arrival))) {
    rowErrors.push(
      `Malformed date stamp string block discovered: "${row.new_expected_arrival}"`
    );
  }

  return rowErrors.length > 0
    ? { row: rowNum, identifier: row.current_id || `Row ${rowNum}`, details: rowErrors }
    : null;
};

// ─── Unit Validators ──────────────────────────────────────────────────────────

const validateNewUnitRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;

  if (!hasValue(row.engine)) {
    rowErrors.push("Engine number is required");
  } else if (row.engine.toLowerCase() === row.frame?.toLowerCase()) {
    rowErrors.push("Engine number and Frame number cannot be identical.");
  }

  const currentStatus = row.status?.toString().trim().toUpperCase();
  if (!currentStatus || !VALID_UNIT_STATUSES.includes(currentStatus)) {
    rowErrors.push(
      `Invalid status: "${row.status}". Must be ${VALID_UNIT_STATUSES.join(", ")}`
    );
  }

  if (validMetadata?.engines && validMetadata.engines.includes(row.engine?.toString().trim())) {
    rowErrors.push(`Engine number "${row.engine}" already exists in the database`);
  }

  const locId = parseInt(row.last_location_id);
  if (isNaN(locId)) {
    rowErrors.push(`Location ID must be a number (got: "${row.last_location_id}")`);
  } else if (validMetadata?.locationIds && !validMetadata.locationIds.includes(locId)) {
    rowErrors.push(`Location ID ${locId} does not exist in the database`);
  }

  if (validMetadata?.waybillCodes) {
    const cleanCode = row.waybill_code?.toString().trim();
    if (!cleanCode || !validMetadata.waybillCodes.includes(cleanCode)) {
      rowErrors.push(`Waybill Code "${row.waybill_code}" not found in database`);
    }
  }

  return rowErrors.length > 0
    ? { row: rowNum, engine: row.engine || "N/A", details: rowErrors }
    : null;
};

const validateUpdateUnitRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;

  if (!hasValue(row.old_engine)) {
    rowErrors.push(
      "Missing key tracking constraint: 'old_engine' column must contain data"
    );
  } else {
    const cleanEngine = row.old_engine.toString().trim();
    if (validMetadata?.engines && !validMetadata.engines.includes(cleanEngine)) {
      rowErrors.push(`Old Engine number "${cleanEngine}" does not exist in database`);
    }
  }

  const cleanNewEngine = row.new_engine?.toString().trim();
  if (cleanNewEngine && validMetadata?.engines && validMetadata.engines.includes(cleanNewEngine)) {
    rowErrors.push(`Engine number "${cleanNewEngine}" already exists in the database`);
  }

  if (hasValue(row.new_status)) {
    const currentStatus = row.new_status.toString().trim().toUpperCase();
    if (!VALID_UNIT_STATUSES.includes(currentStatus)) {
      rowErrors.push(
        `Invalid status: "${row.new_status}". Must be ${VALID_UNIT_STATUSES.join(", ")}`
      );
    }
  }

  if (hasValue(row.new_last_location_id)) {
    const locId = parseInt(row.new_last_location_id);
    if (isNaN(locId)) {
      rowErrors.push(`Location ID must be a number (got: "${row.new_last_location_id}")`);
    } else if (validMetadata?.locationIds && !validMetadata.locationIds.includes(locId)) {
      rowErrors.push(`Location ID ${locId} does not exist in the database`);
    }
  }

  if (hasValue(row.new_waybill_code) && validMetadata?.waybillCodes) {
    const cleanCode = row.new_waybill_code.toString().trim();
    if (!validMetadata.waybillCodes.includes(cleanCode)) {
      rowErrors.push(`Waybill Code "${row.new_waybill_code}" not found in database`);
    }
  }

  return rowErrors.length > 0
    ? { row: rowNum, engine: row.old_engine || "N/A", details: rowErrors }
    : null;
};

// ─── Manifest Validators ──────────────────────────────────────────────────────

const validateManifestRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;

  if (!hasValue(row.engine)) {
    rowErrors.push("Engine number is required");
  } else if (
    validMetadata?.engines &&
    !validMetadata.engines.includes(row.engine.toString().trim())
  ) {
    rowErrors.push(
      `Engine "${row.engine}" does not exist in the database`
    );
  }

  if (!hasValue(row.waybill_code)) {
    rowErrors.push("Waybill code is required");
  } else if (
    validMetadata?.waybillCodes &&
    !validMetadata.waybillCodes.includes(row.waybill_code.toString().trim())
  ) {
    rowErrors.push(
      `Waybill code "${row.waybill_code}" does not exist in the database`
    );
  }

  return rowErrors.length > 0
    ? { row: rowNum, engine: row.engine || `Row ${rowNum}`, details: rowErrors }
    : null;
};

module.exports = {
  validateNewWaybillRow,
  validateUpdateWaybillRow,
  validateNewUnitRow,
  validateUpdateUnitRow,
  validateManifestRow,
  throwIfErrors,
};

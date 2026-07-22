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

const resolveId = (value, collection, nameField) => {
  if (!hasValue(value)) return null;
  const str = value.toString().trim();

  const byId = collection.find((item) => item.id.toString() === str);
  if (byId) return byId.id;

  const byName = collection.find(
    (item) => item[nameField].toLowerCase() === str.toLowerCase()
  );
  return byName ? byName.id : null;
};

// ─── Waybill Validators ───────────────────────────────────────────────────────

const validateNewWaybillRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;
  const resolvedRow = { ...row };

  if (!hasValue(row.code)) {
    rowErrors.push("Missing required field: 'code'");
  } else {
    const cleanCode = row.code.toString().trim();
    if (cleanCode.length < 2 || cleanCode.length > 6) {
      rowErrors.push(`Code prefix "${row.code}" must be between 2 and 6 characters.`);
    }
    if (!/^[A-Za-z0-9]+$/.test(cleanCode)) {
      rowErrors.push(`Code prefix "${row.code}" must contain only letters and numbers (no spaces or symbols).`);
    }
  }

  if (
    !hasValue(row.status) ||
    !VALID_WAYBILL_STATUSES.includes(row.status.toString().trim().toUpperCase())
  ) {
    rowErrors.push(`Invalid or missing status: "${row.status}"`);
  }

  ["origin_id", "destination_id"].forEach((field) => {
    const resolved = resolveId(row[field], validMetadata.locations, "name");
    if (resolved === null) {
      rowErrors.push(
        `'${field}' value "${row[field]}" does not match any known location (accepts ID or name).`
      );
    } else {
      resolvedRow[field] = resolved;
    }
  });

  const resolvedTruck = resolveId(row.truck_id, validMetadata.trucks, "plate_number");
  if (resolvedTruck === null) {
    rowErrors.push(
      `'truck_id' value "${row.truck_id}" does not match any known truck (accepts ID or plate number).`
    );
  } else {
    resolvedRow.truck_id = resolvedTruck;
  }

  const resolvedDriver = resolveId(row.driver_id, validMetadata.drivers, "full_name");
  if (resolvedDriver === null) {
    rowErrors.push(
      `'driver_id' value "${row.driver_id}" does not match any known driver (accepts ID or full name).`
    );
  } else {
    resolvedRow.driver_id = resolvedDriver;
  }

  const qty = parseInt(row.expected_quantity);
  if (isNaN(qty) || qty < 0 || qty > 9999) {
    rowErrors.push(`Quantity must be 0-9999 (got: ${row.expected_quantity})`);
  }

  if (!hasValue(row.expected_arrival) || isNaN(Date.parse(row.expected_arrival))) {
    rowErrors.push(`Invalid arrival date: "${row.expected_arrival}"`);
  }

  return rowErrors.length > 0
    ? { row: rowNum, identifier: row.code || `Row ${rowNum}`, details: rowErrors }
    : { resolved: resolvedRow };
};

const validateUpdateWaybillRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;
  const resolvedRow = { ...row };

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

  ["new_origin_id", "new_destination_id"].forEach((field) => {
    if (!hasValue(row[field])) return;
    const baseField = field.replace("new_", "");
    const resolved = resolveId(row[field], validMetadata.locations, "name");
    if (resolved === null) {
      rowErrors.push(
        `'${field}' value "${row[field]}" does not match any known location (accepts ID or name).`
      );
    } else {
      resolvedRow[field] = resolved;
    }
  });

  if (hasValue(row.new_truck_id)) {
    const resolved = resolveId(row.new_truck_id, validMetadata.trucks, "plate_number");
    if (resolved === null) {
      rowErrors.push(
        `'new_truck_id' value "${row.new_truck_id}" does not match any known truck (accepts ID or plate number).`
      );
    } else {
      resolvedRow.new_truck_id = resolved;
    }
  }

  if (hasValue(row.new_driver_id)) {
    const resolved = resolveId(row.new_driver_id, validMetadata.drivers, "full_name");
    if (resolved === null) {
      rowErrors.push(
        `'new_driver_id' value "${row.new_driver_id}" does not match any known driver (accepts ID or full name).`
      );
    } else {
      resolvedRow.new_driver_id = resolved;
    }
  }

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
    : { resolved: resolvedRow };
};

// ─── Unit Validators ──────────────────────────────────────────────────────────

const validateNewUnitRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;
  const resolvedRow = { ...row };

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

  const resolved = resolveId(row.last_location_id, validMetadata.locations, "name");
  if (resolved === null) {
    rowErrors.push(
      `'last_location_id' value "${row.last_location_id}" does not match any known location (accepts ID or name).`
    );
  } else {
    resolvedRow.last_location_id = resolved;
  }

  if (validMetadata?.waybillCodes) {
    const cleanCode = row.waybill_code?.toString().trim();
    if (!cleanCode || !validMetadata.waybillCodes.includes(cleanCode)) {
      rowErrors.push(`Waybill Code "${row.waybill_code}" not found in database`);
    }
  }

  return rowErrors.length > 0
    ? { row: rowNum, engine: row.engine || "N/A", details: rowErrors }
    : { resolved: resolvedRow };
};

const validateUpdateUnitRow = (row, index, validMetadata) => {
  const rowErrors = [];
  const rowNum = index + 1;
  const resolvedRow = { ...row };

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
    const resolved = resolveId(row.new_last_location_id, validMetadata.locations, "name");
    if (resolved === null) {
      rowErrors.push(
        `'new_last_location_id' value "${row.new_last_location_id}" does not match any known location (accepts ID or name).`
      );
    } else {
      resolvedRow.new_last_location_id = resolved;
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
    : { resolved: resolvedRow };
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
    rowErrors.push(`Engine "${row.engine}" does not exist in the database`);
  }

  if (!hasValue(row.waybill_code)) {
    rowErrors.push("Waybill code is required");
  } else if (
    validMetadata?.waybillCodes &&
    !validMetadata.waybillCodes.includes(row.waybill_code.toString().trim())
  ) {
    rowErrors.push(`Waybill code "${row.waybill_code}" does not exist in the database`);
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
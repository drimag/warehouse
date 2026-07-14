const Unit = require("../../models/unitModel");
const Waybill = require("../../models/waybillModel");
const {
  validateNewWaybillRow,
  validateUpdateWaybillRow,
  validateNewUnitRow,
  validateUpdateUnitRow,
  throwIfErrors,
} = require("./bulkUploadValidator");

// ─── Shared Helpers ───────────────────────────────────────────────────────────

const safeField = (val, formatter = (v) => v) => {
  if (val === undefined || val === null || val.toString().trim() === "") return null;
  return formatter(val);
};

// ─── Waybill Services ─────────────────────────────────────────────────────────

const processNewWaybills = async (data, validMetadata) => {
  const errors = data
    .map((row, idx) => validateNewWaybillRow(row, idx, validMetadata))
    .filter(Boolean);
  throwIfErrors(errors);

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
  return { isSuccess: result.success, count: result.count, type: "Waybill Creation" };
};

const processUpdateWaybills = async (data, validMetadata) => {
  const errors = data
    .map((row, idx) => validateUpdateWaybillRow(row, idx, validMetadata))
    .filter(Boolean);
  throwIfErrors(errors);

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
      new Date(v).toISOString()
    ),
  }));

  const result = await Waybill.updateBulkWaybills(formattedData);
  return { isSuccess: result.success, count: result.count, type: "Waybill Update" };
};

// ─── Unit Services ────────────────────────────────────────────────────────────

const processNewUnits = async (data, validMetadata, userId) => {
  const errors = data
    .map((row, idx) => validateNewUnitRow(row, idx, validMetadata))
    .filter(Boolean);
  throwIfErrors(errors);

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
  return { isSuccess: result.success, count: result.count, type: "Unit Creation" };
};

const processUpdateUnits = async (data, validMetadata, userId) => {
  const errors = data
    .map((row, idx) => validateUpdateUnitRow(row, idx, validMetadata))
    .filter(Boolean);
  throwIfErrors(errors);

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
  return { isSuccess: result.success, count: result.count, type: "Unit Update" };
};

module.exports = {
  processNewWaybills,
  processUpdateWaybills,
  processNewUnits,
  processUpdateUnits,
};

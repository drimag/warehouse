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

const REQUIRED_MANIFEST_HEADERS = ["engine", "waybill_code"];

const VALID_WAYBILL_STATUSES = ["ADVICE", "IN_TRANSIT", "ARRIVED", "CLOSED"];
const VALID_UNIT_STATUSES = ["IN_TRANSIT", "IN_STORAGE", "CLOSED"];

const WAYBILL_STATUS_TO_MANIFEST_TYPE = (waybillStatus) => {
  if (["ADVICE", "LOADING"].includes(waybillStatus)) return "ADVICE";
  if (["IN_TRANSIT", "UNLOADING"].includes(waybillStatus)) return "DEPARTURE";
  if (["ARRIVED", "CLOSED"].includes(waybillStatus)) return "ARRIVAL";
  return "UNKNOWN";
};

module.exports = {
  REQUIRED_WAYBILL_HEADERS,
  REQUIRED_WAYBILL_UPDATE_HEADERS,
  REQUIRED_UNIT_HEADERS,
  REQUIRED_UNIT_UPDATE_HEADERS,
  REQUIRED_MANIFEST_HEADERS,
  VALID_WAYBILL_STATUSES,
  VALID_UNIT_STATUSES,
  WAYBILL_STATUS_TO_MANIFEST_TYPE,
};

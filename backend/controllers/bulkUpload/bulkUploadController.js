const ExcelJS = require("exceljs");
const ReferenceModel = require("../../models/referenceModel");
const Waybill = require("../../models/waybillModel");
const Unit = require("../../models/unitModel");
const {
  REQUIRED_WAYBILL_HEADERS,
  REQUIRED_WAYBILL_UPDATE_HEADERS,
  REQUIRED_UNIT_HEADERS,
  REQUIRED_UNIT_UPDATE_HEADERS,
} = require("./bulkUploadConstants");
const {
  processNewWaybills,
  processUpdateWaybills,
  processNewUnits,
  processUpdateUnits,
} = require("./bulkUploadService");

exports.bulkUploadSheet = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Check the field name." });
  }

  try {
    // Parse the Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    // Extract headers
    const headers = worksheet
      .getRow(1)
      .values.map((v) => v?.toString().toLowerCase().trim());

    // Parse rows into JSON
    const data = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData = {};
      row.values.forEach((value, index) => {
        const header = headers[index];
        if (header) rowData[header] = value;
      });
      data.push(rowData);
    });

    // Fetch reference data for validation
    const [locationIds, waybillCodes, engines] = await Promise.all([
      ReferenceModel.getAllLocationIds(),
      Waybill.getAllWaybillCodes(),
      Unit.getAllEngines(),
    ]);
    const validMetadata = { locationIds, waybillCodes, engines };

    // Detect sheet type and process
    const matches = (required) => required.every((h) => headers.includes(h));
    const userId = req.user?.id;

    if (matches(REQUIRED_WAYBILL_HEADERS)) {
      const result = await processNewWaybills(data, validMetadata);
      return res.status(200).json({ type: "WAYBILLS", ...result });
    }

    if (matches(REQUIRED_WAYBILL_UPDATE_HEADERS)) {
      const result = await processUpdateWaybills(data, validMetadata);
      return res.status(200).json({ type: "WAYBILLS", ...result });
    }

    if (matches(REQUIRED_UNIT_HEADERS)) {
      const result = await processNewUnits(data, validMetadata, userId);
      return res.status(200).json({ type: "UNITS", ...result });
    }

    if (matches(REQUIRED_UNIT_UPDATE_HEADERS)) {
      const result = await processUpdateUnits(data, validMetadata, userId);
      return res.status(200).json({ type: "UNITS", ...result });
    }

    return res.status(400).json({ error: "Columns do not match Waybill or Unit templates." });

  } catch (err) {
    console.error(err);

    if (err.validationErrors) {
      return res.status(422).json({
        message: "Multiple validation errors found in the file.",
        errors: err.validationErrors,
      });
    }

    return res.status(500).json({ error: "Internal Server Error during bulk processing" });
  }
};

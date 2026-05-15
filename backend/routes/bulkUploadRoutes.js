const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const bulkUploadController = require("../controllers/bulkUploadController");

router.post(
  "/generic_sheet",
  upload.single("excelFile"),
  bulkUploadController.bulkUploadSheet,
);

module.exports = router;

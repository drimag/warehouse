const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const bulkUploadController = require("../controllers/bulkUpload/bulkUploadController");
const { authenticateToken, restrictToRoles } = require('../middleware/auth');

router.post(
  "/generic_sheet",
  authenticateToken,
  restrictToRoles("ADMIN"),
  upload.single("excelFile"),
  bulkUploadController.bulkUploadSheet,
);

module.exports = router;

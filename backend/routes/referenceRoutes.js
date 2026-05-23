const express = require("express");
const router = express.Router();
const referenceController = require("../controllers/referenceController");
const { authenticateToken, restrictToRoles } = require("../middleware/auth");

router.get(
  "/trucks",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  referenceController.getTrucks,
);
router.get(
  "/drivers",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  referenceController.getDrivers,
);
router.get(
  "/locations",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  referenceController.getLocations,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");
const { authenticateToken, restrictToRoles } = require("../middleware/auth");

// URL: /api/units
router.get(
  "/",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  unitController.getAllUnits,
);
router.get(
  "/history/:unitID",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  unitController.getUnitHistory,
);
router.post(
  "/scan/:scan",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  unitController.scanUnitByVin,
);
router.post(
  "/new_scan/:scan",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  unitController.newScannedUnit,
);
router.post(
  "/in_transit/:scan",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  unitController.setUnitInTransit,
);
router.post(
  "/new_unit",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  unitController.insertNewUnit,
);

module.exports = router;

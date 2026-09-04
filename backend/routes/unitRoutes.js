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
  "/find_unit/:scan",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  unitController.findUnitByVIN,
);
router.post(
  "/new_unit",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  unitController.insertNewUnit,
);
router.get(
  "/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  unitController.getUnit,
);
router.patch(
  "/:id",
  authenticateToken,
  restrictToRoles("ADMIN"),
  unitController.updateUnit,
);

module.exports = router;

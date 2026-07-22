const express = require("express");
const router = express.Router();
const manifestController = require("../controllers/manifestController");
const { authenticateToken, restrictToRoles } = require("../middleware/auth");

router.post(
  "/createNew",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  manifestController.createManifest,
);

router.post(
  "/finalize_scan",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  manifestController.finalizeScan,
);

router.get(
  "/get_unit_manifest/:unitId",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  manifestController.getUnitManifest,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const waybillController = require("../controllers/waybillController");
const { authenticateToken, restrictToRoles } = require("../middleware/auth");

router.patch(
  "/start_scan/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.startScanning,
);
router.patch(
  "/cancel_scan/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.cancelScanning,
);
router.get(
  "/scanning",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.getWaybillForScan,
);
router.get(
  "/display/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  waybillController.getWaybillDisplayById,
);
router.post(
  "/save_form",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.saveWaybillForm,
);

router.patch(
  "/loading_timeout/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.touchLoadingTimeout,
);

router.patch(
  "/:id/close",
  authenticateToken,
  restrictToRoles("ADMIN"),
  waybillController.closeWaybill,
);

//TODO: set route to something specific
router.get(
  "/",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  waybillController.getAllWaybillDisplay,
);

router.get(
  "/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER", "VIEWER"),
  waybillController.getWaybillDetails,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const waybillController = require("../controllers/waybillController");
const { authenticateToken, restrictToRoles } = require("../middleware/auth");

// TODO: Change to router.post
router.get(
  "/start_scan/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.startScanning,
);
// TODO: Change to router.post
router.get(
  "/advice/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.setAdvice,
);
// TODO: Change to router.post
router.get(
  "/scanning",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.getWaybillForScan,
);
// TODO: Change to router.post
router.get(
  "/in_transit/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.setInTransit,
);
// TODO: Change to router.post
router.get(
  "/arrived/:id",
  authenticateToken,
  restrictToRoles("ADMIN", "SCANNER"),
  waybillController.setArrived,
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

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

module.exports = router;

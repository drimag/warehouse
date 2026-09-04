const express = require("express");
const router = express.Router();
const { authenticateToken, restrictToRoles } = require("../middleware/auth");
const { triggerArchive, listArchives, downloadArchive } = require("../controllers/archiveController");

// Both routes require a valid session AND ADMIN role
router.use(authenticateToken);
router.use(restrictToRoles("ADMIN"));

router.get("/", listArchives);
router.post("/run", triggerArchive);
router.get("/:id/download", downloadArchive);

module.exports = router;

const express = require("express");
const router = express.Router();
const { authenticateToken, restrictToRoles } = require("../middleware/auth");
const { triggerArchive, listArchives } = require("../controllers/archiveController");

// Both routes require a valid session AND ADMIN role
router.use(authenticateToken);
router.use(restrictToRoles("ADMIN"));

// GET  /admin/archive       → list all past archives
// POST /admin/archive/run   → manually trigger archive now
router.get("/", listArchives);
router.post("/run", triggerArchive);

module.exports = router;

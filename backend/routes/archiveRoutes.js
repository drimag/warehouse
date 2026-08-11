const express = require("express");
const router = express.Router();
const { authenticateToken, restrictToRoles } = require("../middleware/auth");
const { triggerArchive, listArchives } = require("../controllers/archiveController");

// Both routes require a valid session AND ADMIN role
router.use(authenticateToken);
router.use(restrictToRoles("ADMIN"));

router.get("/", listArchives);
router.post("/run", triggerArchive);

module.exports = router;

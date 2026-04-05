const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// URL: /api/units
router.get('/', unitController.getAllUnits);
router.get('/history/:unitID', unitController.getUnitHistory);
router.get('/scan/:scan', unitController.findUnitByVin);

module.exports = router;
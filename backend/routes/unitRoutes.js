const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// URL: /api/units
router.get('/', unitController.getAllUnits);
router.get('/history/:unitID', unitController.getUnitHistory);
router.post('/scan/:scan', unitController.scanUnitByVin);
router.post('/new_scan/:scan', unitController.newScannedUnit);
router.post('/in_transit/:scan', unitController.setUnitInTransit);

module.exports = router;
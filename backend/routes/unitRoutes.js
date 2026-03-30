const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// URL: /api/units
router.get('/', unitController.getAllUnits);
router.get('/:unitID', unitController.getUnitHistory);

module.exports = router;
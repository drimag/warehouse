const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// URL: /api/units
router.get('/', unitController.getAllUnits);
router.get('/:engine', unitController.getUnitHistory);

module.exports = router;
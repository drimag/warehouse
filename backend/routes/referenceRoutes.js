const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/referenceController');

router.get('/trucks', referenceController.getTrucks);
router.get('/drivers', referenceController.getDrivers);
router.get('/locations', referenceController.getLocations);

module.exports = router;
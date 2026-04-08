const express = require('express');
const router = express.Router();
const waybillController = require('../controllers/waybillController');

// URL: /api/waybills
router.get('/loading/:id', waybillController.startLoading);
router.get('/advice/:id', waybillController.setAdvice);
router.get('/scanning', waybillController.getWaybillForScan);
router.get('/in_transit/:id', waybillController.setInTransit);
router.get('/arrived/:id', waybillController.setArrived);
router.get('/', waybillController.getAllWaybillDisplay);
router.get('/:id', waybillController.getWaybillDetails);

module.exports = router;
const express = require('express');
const router = express.Router();
const waybillController = require('../controllers/waybillController');

// URL: /api/waybills
router.get('/loading/:id', waybillController.startLoading);
router.get('/in_storage/:id', waybillController.inStorage);
router.get('/scanning', waybillController.getWaybillForScan);
router.get('/', waybillController.getAllWaybillDisplay);
router.get('/:id', waybillController.getWaybillDetails);

module.exports = router;
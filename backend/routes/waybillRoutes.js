const express = require('express');
const router = express.Router();
const waybillController = require('../controllers/waybillController');

// URL: /api/waybills
// TODO: change method
router.get('/loading/:id', waybillController.startLoading);
router.get('/advice/:id', waybillController.setAdvice);
router.get('/scanning', waybillController.getWaybillForScan);
router.get('/in_transit/:id', waybillController.setInTransit);
router.get('/arrived/:id', waybillController.setArrived);
router.get('/display/:id', waybillController.getWaybillDisplayById);
router.post('/save_form', waybillController.saveWaybillForm);
router.get('/', waybillController.getAllWaybillDisplay);

router.get('/:id', waybillController.getWaybillDetails);

module.exports = router;
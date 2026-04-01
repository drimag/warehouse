const express = require('express');
const router = express.Router();
const waybillController = require('../controllers/waybillController');

// URL: /api/waybills
router.get('/', waybillController.getAllWaybillDisplay);
router.get('/:id', waybillController.getWaybillDetails);

module.exports = router;
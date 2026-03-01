const express = require('express');
const router = express.Router();
const waybillController = require('../controllers/waybillController');

// URL: /api/waybills
router.get('/', waybillController.getAllWaybills);

module.exports = router;
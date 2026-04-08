const express = require('express');
const router = express.Router();
const manifestController = require('../controllers/manifestController');

router.post('/waybill/:waybillId/unit/:unitId/type/:type/user/:userId', manifestController.createManifest);

module.exports = router;
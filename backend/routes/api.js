const router = require('express').Router();

const authRoutes = require('./authRoutes');
const waybillRoutes = require('./waybillRoutes');
const unitRoutes = require('./unitRoutes');
const referenceRoutes = require('./referenceRoutes');
const manifestRoutes = require('./manifestRoutes');
const bulkUploadRoutes = require('./bulkUploadRoutes');
const archiveRoutes = require("./archiveRoutes");

// Mount them onto specific base URLs
router.use('/auth', authRoutes); 
router.use('/waybills', waybillRoutes);
router.use('/units', unitRoutes);
router.use('/references', referenceRoutes);
router.use('/manifest', manifestRoutes);
router.use('/bulkUpload', bulkUploadRoutes);
router.use("/admin/archive", archiveRoutes);

module.exports = router;
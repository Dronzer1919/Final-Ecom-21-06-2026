const express = require('express');
const router = express.Router();
const vendorController = require('./vendor.controller');
const vendorMiddleware = require('./vendor.middleware');

router.post('/bulk-create', vendorController.bulkCreateVendors);
router.post('/', vendorMiddleware.createVendorValidation, vendorMiddleware.validate, vendorController.createVendor);
router.get('/', vendorMiddleware.queryValidation, vendorMiddleware.validate, vendorController.getAllVendors);
router.get('/:id', vendorMiddleware.getVendorByIdValidation, vendorMiddleware.validate, vendorController.getVendorById);
router.put('/:id', vendorMiddleware.updateVendorValidation, vendorMiddleware.validate, vendorController.updateVendor);
router.delete('/:id', vendorMiddleware.getVendorByIdValidation, vendorMiddleware.validate, vendorController.deleteVendor);

module.exports = router;

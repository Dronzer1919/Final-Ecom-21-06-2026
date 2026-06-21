const express = require('express');
const router = express.Router();
const barcodeController = require('./barcode.controller');
const barcodeMiddleware = require('./barcode.middleware');

router.post('/create', barcodeMiddleware.createBarcodeValidation, barcodeMiddleware.validate, barcodeController.createBarcode);
router.get('/', barcodeMiddleware.queryValidation, barcodeMiddleware.validate, barcodeController.getAllBarcodes);
router.get('/:id', barcodeMiddleware.getBarcodeByIdValidation, barcodeMiddleware.validate, barcodeController.getBarcodeById);
router.put('/:id', barcodeMiddleware.updateBarcodeValidation, barcodeMiddleware.validate, barcodeController.updateBarcode);
router.delete('/:id', barcodeMiddleware.getBarcodeByIdValidation, barcodeMiddleware.validate, barcodeController.deleteBarcode);

module.exports = router;

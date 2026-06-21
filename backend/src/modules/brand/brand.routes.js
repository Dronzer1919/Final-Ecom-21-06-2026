const express = require('express');
const router = express.Router();
const brandController = require('./brand.controller');
const brandMiddleware = require('./brand.middleware');

router.post('/bulk-create', brandController.bulkCreateBrands);
router.post('/create', brandMiddleware.createBrandValidation, brandMiddleware.validate, brandController.createBrand);
router.get('/', brandMiddleware.queryValidation, brandMiddleware.validate, brandController.getAllBrands);
router.get('/:id', brandMiddleware.getBrandByIdValidation, brandMiddleware.validate, brandController.getBrandById);
router.put('/:id', brandMiddleware.updateBrandValidation, brandMiddleware.validate, brandController.updateBrand);
router.delete('/:id', brandMiddleware.getBrandByIdValidation, brandMiddleware.validate, brandController.deleteBrand);

module.exports = router;

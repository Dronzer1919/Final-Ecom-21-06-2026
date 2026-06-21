const express = require('express');
const router = express.Router();
const unitController = require('./unit.controller');
const unitMiddleware = require('./unit.middleware');

router.post('/bulk-create', unitController.bulkCreateUnits);
router.post('/create', unitMiddleware.createUnitValidation, unitMiddleware.validate, unitController.createUnit);
router.get('/', unitMiddleware.queryValidation, unitMiddleware.validate, unitController.getAllUnits);
router.get('/:id', unitMiddleware.getUnitByIdValidation, unitMiddleware.validate, unitController.getUnitById);
router.put('/:id', unitMiddleware.updateUnitValidation, unitMiddleware.validate, unitController.updateUnit);
router.delete('/:id', unitMiddleware.getUnitByIdValidation, unitMiddleware.validate, unitController.deleteUnit);

module.exports = router;

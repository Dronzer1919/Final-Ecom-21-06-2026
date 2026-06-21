const express = require('express');
const router = express.Router();
const warehouseController = require('./warehouse.controller');
const warehouseMiddleware = require('./warehouse.middleware');

router.post('/create', warehouseMiddleware.createWarehouseValidation, warehouseMiddleware.validate, warehouseController.createWarehouse);
router.post('/bulk-create', warehouseController.bulkCreateWarehouses);
router.get('/', warehouseMiddleware.queryValidation, warehouseMiddleware.validate, warehouseController.getAllWarehouses);
router.get('/:id', warehouseMiddleware.getWarehouseByIdValidation, warehouseMiddleware.validate, warehouseController.getWarehouseById);
router.put('/:id', warehouseMiddleware.updateWarehouseValidation, warehouseMiddleware.validate, warehouseController.updateWarehouse);
router.delete('/:id', warehouseMiddleware.getWarehouseByIdValidation, warehouseMiddleware.validate, warehouseController.deleteWarehouse);

module.exports = router;

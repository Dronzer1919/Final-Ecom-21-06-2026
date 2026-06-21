const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const categoryMiddleware = require('./category.middleware');

router.post('/create', categoryMiddleware.createCategoryValidation, categoryMiddleware.validate, categoryController.createCategory);
router.post('/bulk-create', categoryController.bulkCreateCategories);
router.get('/', categoryMiddleware.queryValidation, categoryMiddleware.validate, categoryController.getAllCategories);
router.get('/:id', categoryMiddleware.getCategoryByIdValidation, categoryMiddleware.validate, categoryController.getCategoryById);
router.put('/:id', categoryMiddleware.updateCategoryValidation, categoryMiddleware.validate, categoryController.updateCategory);
router.delete('/:id', categoryMiddleware.getCategoryByIdValidation, categoryMiddleware.validate, categoryController.deleteCategory);

module.exports = router;

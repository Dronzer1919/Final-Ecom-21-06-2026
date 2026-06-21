const express = require('express');
const router = express.Router();
const subcategoryController = require('./subcategory.controller');
const subcategoryMiddleware = require('./subcategory.middleware');

router.post('/create', subcategoryMiddleware.createSubcategoryValidation, subcategoryMiddleware.validate, subcategoryController.createSubcategory);
router.post('/bulk-create', subcategoryController.bulkCreateSubcategories);
router.get('/', subcategoryMiddleware.queryValidation, subcategoryMiddleware.validate, subcategoryController.getAllSubcategories);
router.get('/:id', subcategoryMiddleware.getSubcategoryByIdValidation, subcategoryMiddleware.validate, subcategoryController.getSubcategoryById);
router.put('/:id', subcategoryMiddleware.updateSubcategoryValidation, subcategoryMiddleware.validate, subcategoryController.updateSubcategory);
router.delete('/:id', subcategoryMiddleware.getSubcategoryByIdValidation, subcategoryMiddleware.validate, subcategoryController.deleteSubcategory);

module.exports = router;

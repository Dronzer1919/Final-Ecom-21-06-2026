const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const productMiddleware = require('./product.middleware');

/**
 * @route   POST /api/products/create
 * @desc    Create a new product
 * @access  Private (add auth middleware later)
 */
router.post(
  '/create',
  productMiddleware.createProductValidation,
  productMiddleware.validate,
  productController.createProduct
);

/**
 * @route   POST /api/products/bulk-create
 * @desc    Bulk create multiple products from an array
 * @access  Private (add auth middleware later)
 */
router.post(
  '/bulk-create',
  productController.bulkCreateProducts
);

/**
 * @route   POST /api/products/bulk-create-multi-vendor
 * @desc    Bulk create products where each product has multiple vendors
 * @access  Private (add auth middleware later)
 */
router.post(
  '/bulk-create-multi-vendor',
  productController.bulkCreateMultiVendorProducts
);

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination, filtering, and search
 * @access  Public
 */
router.get(
  '/',
  productMiddleware.queryValidation,
  productMiddleware.validate,
  productController.getAllProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get(
  '/:id',
  productMiddleware.getProductByIdValidation,
  productMiddleware.validate,
  productController.getProductById
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (add auth middleware later)
 */
router.put(
  '/:id',
  productMiddleware.updateProductValidation,
  productMiddleware.validate,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (soft delete)
 * @access  Private (add auth middleware later)
 */
router.delete(
  '/:id',
  productMiddleware.deleteProductValidation,
  productMiddleware.validate,
  productController.deleteProduct
);

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get(
  '/category/:category',
  productController.getProductsByCategory
);

/**
 * @route   GET /api/products/low-stock/alert
 * @desc    Get low stock products
 * @access  Private (add auth middleware later)
 */
router.get(
  '/low-stock/alert',
  productController.getLowStockProducts
);

module.exports = router;

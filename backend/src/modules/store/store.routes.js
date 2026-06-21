const express = require('express');
const router = express.Router();
const storeController = require('./store.controller');
const storeMiddleware = require('./store.middleware');

/**
 * @route   POST /api/stores/create
 * @desc    Create a new store
 * @access  Private
 */
router.post(
  '/create',
  storeMiddleware.createStoreValidation,
  storeMiddleware.validate,
  storeController.createStore
);
router.post('/bulk-create', storeController.bulkCreateStores);

/**
 * @route   GET /api/stores
 * @desc    Get all stores with pagination and search
 * @access  Public
 */
router.get(
  '/',
  storeMiddleware.queryValidation,
  storeMiddleware.validate,
  storeController.getAllStores
);

/**
 * @route   GET /api/stores/:id
 * @desc    Get single store by ID
 * @access  Public
 */
router.get(
  '/:id',
  storeMiddleware.getStoreByIdValidation,
  storeMiddleware.validate,
  storeController.getStoreById
);

/**
 * @route   PUT /api/stores/:id
 * @desc    Update a store
 * @access  Private
 */
router.put(
  '/:id',
  storeMiddleware.updateStoreValidation,
  storeMiddleware.validate,
  storeController.updateStore
);

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete a store
 * @access  Private
 */
router.delete(
  '/:id',
  storeMiddleware.getStoreByIdValidation,
  storeMiddleware.validate,
  storeController.deleteStore
);

module.exports = router;

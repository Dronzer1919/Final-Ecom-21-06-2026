const Store = require('./store.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

/**
 * @desc    Create a new store
 * @route   POST /api/stores/create
 * @access  Private
 */
const createStore = asyncHandler(async (req, res) => {
  const { name, code, phone, email, address } = req.body;

  // Check if store with same name or code already exists
  const existingStore = await Store.findOne({
    $or: [{ name }, { code }]
  });

  if (existingStore) {
    throw new ValidationError('Store with this name or code already exists');
  }

  const store = await Store.create({
    name,
    code,
    phone,
    email,
    address
  });

  successResponse(res, 201, 'Store created successfully', store);
});

/**
 * @desc    Get all stores
 * @route   GET /api/stores
 * @access  Public
 */
const getAllStores = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = {};

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const stores = await Store.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Store.countDocuments(query);

  successResponse(res, 200, 'Stores retrieved successfully', {
    stores,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

/**
 * @desc    Get single store by ID
 * @route   GET /api/stores/:id
 * @access  Public
 */
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  successResponse(res, 200, 'Store retrieved successfully', store);
});

/**
 * @desc    Update store
 * @route   PUT /api/stores/:id
 * @access  Private
 */
const updateStore = asyncHandler(async (req, res) => {
  const { name, code, phone, email, address, isActive } = req.body;

  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // Check if updating name or code conflicts with existing stores
  if (name || code) {
    const existingStore = await Store.findOne({
      _id: { $ne: req.params.id },
      $or: [
        ...(name ? [{ name }] : []),
        ...(code ? [{ code }] : [])
      ]
    });

    if (existingStore) {
      throw new ValidationError('Store with this name or code already exists');
    }
  }

  // Update fields
  if (name) store.name = name;
  if (code) store.code = code;
  if (phone !== undefined) store.phone = phone;
  if (email !== undefined) store.email = email;
  if (address) store.address = address;
  if (isActive !== undefined) store.isActive = isActive;

  await store.save();

  successResponse(res, 200, 'Store updated successfully', store);
});

/**
 * @desc    Delete store
 * @route   DELETE /api/stores/:id
 * @access  Private
 */
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  await store.deleteOne();

  successResponse(res, 200, 'Store deleted successfully', null);
});

const bulkCreateStores = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Request body must be a non-empty array of stores');
  }

  const results = { created: [], skipped: [], errors: [] };

  for (let i = 0; i < items.length; i++) {
    const { name, code, phone, email, address } = items[i];

    if (!name || !code) {
      results.errors.push({ index: i, reason: 'name and code are required', item: items[i] });
      continue;
    }

    const existing = await Store.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existing) {
      results.skipped.push({ index: i, reason: 'Duplicate name or code', item: items[i] });
      continue;
    }

    try {
      const store = await Store.create({ name, code, phone, email, address });
      results.created.push(store);
    } catch (err) {
      results.errors.push({ index: i, reason: err.message, item: items[i] });
    }
  }

  successResponse(res, 201, `Bulk upload complete: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`, results);
});

module.exports = {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  bulkCreateStores
};

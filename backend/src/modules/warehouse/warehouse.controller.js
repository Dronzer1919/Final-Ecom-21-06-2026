const Warehouse = require('./warehouse.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createWarehouse = asyncHandler(async (req, res) => {
  const { name, code, phone, email, address, capacity } = req.body;

  const existingWarehouse = await Warehouse.findOne({
    $or: [{ name }, { code }]
  });

  if (existingWarehouse) {
    throw new ValidationError('Warehouse with this name or code already exists');
  }

  const warehouse = await Warehouse.create({
    name,
    code,
    phone,
    email,
    address,
    capacity
  });

  successResponse(res, 201, 'Warehouse created successfully', warehouse);
});

const getAllWarehouses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const warehouses = await Warehouse.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Warehouse.countDocuments(query);

  successResponse(res, 200, 'Warehouses retrieved successfully', {
    warehouses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getWarehouseById = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);

  if (!warehouse) {
    throw new NotFoundError('Warehouse not found');
  }

  successResponse(res, 200, 'Warehouse retrieved successfully', warehouse);
});

const updateWarehouse = asyncHandler(async (req, res) => {
  const { name, code, phone, email, address, capacity, isActive } = req.body;

  const warehouse = await Warehouse.findById(req.params.id);

  if (!warehouse) {
    throw new NotFoundError('Warehouse not found');
  }

  if (name || code) {
    const existingWarehouse = await Warehouse.findOne({
      _id: { $ne: req.params.id },
      $or: [
        ...(name ? [{ name }] : []),
        ...(code ? [{ code }] : [])
      ]
    });

    if (existingWarehouse) {
      throw new ValidationError('Warehouse with this name or code already exists');
    }
  }

  if (name) warehouse.name = name;
  if (code) warehouse.code = code;
  if (phone !== undefined) warehouse.phone = phone;
  if (email !== undefined) warehouse.email = email;
  if (address) warehouse.address = address;
  if (capacity !== undefined) warehouse.capacity = capacity;
  if (isActive !== undefined) warehouse.isActive = isActive;

  await warehouse.save();

  successResponse(res, 200, 'Warehouse updated successfully', warehouse);
});

const deleteWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);

  if (!warehouse) {
    throw new NotFoundError('Warehouse not found');
  }

  await warehouse.deleteOne();

  successResponse(res, 200, 'Warehouse deleted successfully', null);
});

const bulkCreateWarehouses = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Request body must be a non-empty array of warehouses');
  }

  const results = { created: [], skipped: [], errors: [] };

  for (let i = 0; i < items.length; i++) {
    const { name, code, phone, email, address, capacity } = items[i];

    if (!name || !code) {
      results.errors.push({ index: i, reason: 'name and code are required', item: items[i] });
      continue;
    }

    const existing = await Warehouse.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existing) {
      results.skipped.push({ index: i, reason: 'Duplicate name or code', item: items[i] });
      continue;
    }

    try {
      const warehouse = await Warehouse.create({ name, code, phone, email, address, capacity });
      results.created.push(warehouse);
    } catch (err) {
      results.errors.push({ index: i, reason: err.message, item: items[i] });
    }
  }

  successResponse(res, 201, `Bulk upload complete: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`, results);
});

module.exports = {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  bulkCreateWarehouses
};

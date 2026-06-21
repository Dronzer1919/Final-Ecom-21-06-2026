const Unit = require('./unit.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createUnit = asyncHandler(async (req, res) => {
  const { name, shortName, description } = req.body;

  const existingUnit = await Unit.findOne({ $or: [{ name }, { shortName }] });

  if (existingUnit) {
    throw new ValidationError('Unit with this name or short name already exists');
  }

  const unit = await Unit.create({ name, shortName, description });

  successResponse(res, 201, 'Unit created successfully', unit);
});

const getAllUnits = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortName: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const units = await Unit.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  const total = await Unit.countDocuments(query);

  successResponse(res, 200, 'Units retrieved successfully', {
    units,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getUnitById = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);

  if (!unit) {
    throw new NotFoundError('Unit not found');
  }

  successResponse(res, 200, 'Unit retrieved successfully', unit);
});

const updateUnit = asyncHandler(async (req, res) => {
  const { name, shortName, description, isActive } = req.body;

  const unit = await Unit.findById(req.params.id);

  if (!unit) {
    throw new NotFoundError('Unit not found');
  }

  if (name || shortName) {
    const existingUnit = await Unit.findOne({
      _id: { $ne: req.params.id },
      $or: [...(name ? [{ name }] : []), ...(shortName ? [{ shortName }] : [])]
    });

    if (existingUnit) {
      throw new ValidationError('Unit with this name or short name already exists');
    }
  }

  if (name) unit.name = name;
  if (shortName) unit.shortName = shortName;
  if (description !== undefined) unit.description = description;
  if (isActive !== undefined) unit.isActive = isActive;

  await unit.save();

  successResponse(res, 200, 'Unit updated successfully', unit);
});

const deleteUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);

  if (!unit) {
    throw new NotFoundError('Unit not found');
  }

  await unit.deleteOne();

  successResponse(res, 200, 'Unit deleted successfully', null);
});

const bulkCreateUnits = asyncHandler(async (req, res) => {
  const rows = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must be a non-empty array' });
  }

  const created = [];
  const skipped = [];
  const errors = [];

  for (const row of rows) {
    const { name, shortName, description } = row;
    if (!name || !shortName) {
      errors.push({ row, reason: 'name and shortName are required' });
      continue;
    }
    try {
      const existing = await Unit.findOne({ $or: [{ name }, { shortName }] });
      if (existing) {
        skipped.push({ name, shortName, reason: 'already exists' });
        continue;
      }
      const unit = await Unit.create({ name, shortName, description });
      created.push(unit);
    } catch (err) {
      errors.push({ row, reason: err.message });
    }
  }

  successResponse(res, 201, `Bulk create complete: ${created.length} created, ${skipped.length} skipped`, {
    created, skipped, errors
  });
});

module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  bulkCreateUnits
};

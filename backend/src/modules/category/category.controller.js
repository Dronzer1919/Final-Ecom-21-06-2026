const Category = require('./category.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createCategory = asyncHandler(async (req, res) => {
  const { name, code, description, image } = req.body;

  const existingCategory = await Category.findOne({ $or: [{ name }, { code }] });

  if (existingCategory) {
    throw new ValidationError('Category with this name or code already exists');
  }

  const category = await Category.create({ name, code, description, image });

  successResponse(res, 201, 'Category created successfully', category);
});

const getAllCategories = asyncHandler(async (req, res) => {
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
  const categories = await Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  const total = await Category.countDocuments(query);

  successResponse(res, 200, 'Categories retrieved successfully', {
    categories,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  successResponse(res, 200, 'Category retrieved successfully', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, code, description, image, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (name || code) {
    const existingCategory = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [...(name ? [{ name }] : []), ...(code ? [{ code }] : [])]
    });

    if (existingCategory) {
      throw new ValidationError('Category with this name or code already exists');
    }
  }

  if (name) category.name = name;
  if (code) category.code = code;
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  successResponse(res, 200, 'Category updated successfully', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  await category.deleteOne();

  successResponse(res, 200, 'Category deleted successfully', null);
});

const bulkCreateCategories = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Request body must be a non-empty array of categories');
  }

  const results = { created: [], skipped: [], errors: [] };

  for (let i = 0; i < items.length; i++) {
    const { name, code, description, image } = items[i];

    if (!name || !code) {
      results.errors.push({ index: i, reason: 'name and code are required', item: items[i] });
      continue;
    }

    const existing = await Category.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existing) {
      results.skipped.push({ index: i, reason: 'Duplicate name or code', item: items[i] });
      continue;
    }

    try {
      const category = await Category.create({ name, code, description, image });
      results.created.push(category);
    } catch (err) {
      results.errors.push({ index: i, reason: err.message, item: items[i] });
    }
  }

  successResponse(res, 201, `Bulk upload complete: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`, results);
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  bulkCreateCategories
};

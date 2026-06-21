const Subcategory = require('./subcategory.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createSubcategory = asyncHandler(async (req, res) => {
  const { name, code, category, parentSubcategory, description, image } = req.body;

  const existingSubcategory = await Subcategory.findOne({
    $or: [{ code }, { name, category }]
  });

  if (existingSubcategory) {
    throw new ValidationError('Subcategory with this name/category combination or code already exists');
  }

  const subcategory = await Subcategory.create({ name, code, category, parentSubcategory: parentSubcategory || null, description, image });

  successResponse(res, 201, 'Subcategory created successfully', subcategory);
});

const getAllSubcategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, isActive, parentSubcategory } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (parentSubcategory) {
    query.parentSubcategory = parentSubcategory;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const subcategories = await Subcategory.find(query)
    .populate('category', 'name code')
    .populate('parentSubcategory', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  const total = await Subcategory.countDocuments(query);

  successResponse(res, 200, 'Subcategories retrieved successfully', {
    subcategories,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getSubcategoryById = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name code');

  if (!subcategory) {
    throw new NotFoundError('Subcategory not found');
  }

  successResponse(res, 200, 'Subcategory retrieved successfully', subcategory);
});

const updateSubcategory = asyncHandler(async (req, res) => {
  const { name, code, category, parentSubcategory, description, image, isActive } = req.body;

  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    throw new NotFoundError('Subcategory not found');
  }

  if (name || code || category) {
    const existingSubcategory = await Subcategory.findOne({
      _id: { $ne: req.params.id },
      $or: [
        ...(code ? [{ code }] : []),
        ...(name && category ? [{ name, category }] : [])
      ]
    });

    if (existingSubcategory) {
      throw new ValidationError('Subcategory with this name/category combination or code already exists');
    }
  }

  if (name) subcategory.name = name;
  if (code) subcategory.code = code;
  if (category) subcategory.category = category;
  if (parentSubcategory !== undefined) subcategory.parentSubcategory = parentSubcategory || null;
  if (description !== undefined) subcategory.description = description;
  if (image !== undefined) subcategory.image = image;
  if (isActive !== undefined) subcategory.isActive = isActive;

  await subcategory.save();

  successResponse(res, 200, 'Subcategory updated successfully', subcategory);
});

const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    throw new NotFoundError('Subcategory not found');
  }

  await subcategory.deleteOne();

  successResponse(res, 200, 'Subcategory deleted successfully', null);
});

const bulkCreateSubcategories = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Request body must be a non-empty array of subcategories');
  }

  const results = { created: [], skipped: [], errors: [] };

  for (let i = 0; i < items.length; i++) {
    const { name, code, categoryName, categoryCode, category: categoryId, parentSubcategory, description, image } = items[i];

    if (!name || !code) {
      results.errors.push({ index: i, reason: 'name and code are required', item: items[i] });
      continue;
    }

    // Resolve category: accept MongoId, categoryName, or categoryCode
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && (categoryName || categoryCode)) {
      const Category = require('../category/category.model');
      const catQuery = {};
      if (categoryName) catQuery.name = { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') };
      else catQuery.code = categoryCode.toUpperCase();
      const cat = await Category.findOne(catQuery);
      if (cat) resolvedCategoryId = cat._id;
    }

    if (!resolvedCategoryId) {
      results.errors.push({ index: i, reason: 'Cannot resolve category. Provide categoryName, categoryCode, or category (MongoId)', item: items[i] });
      continue;
    }

    const existing = await Subcategory.findOne({ $or: [{ code: code.toUpperCase() }, { name, category: resolvedCategoryId }] });
    if (existing) {
      results.skipped.push({ index: i, reason: 'Duplicate code or name+category combination', item: items[i] });
      continue;
    }

    try {
      const subcategory = await Subcategory.create({ name, code, category: resolvedCategoryId, parentSubcategory: parentSubcategory || null, description, image });
      results.created.push(subcategory);
    } catch (err) {
      results.errors.push({ index: i, reason: err.message, item: items[i] });
    }
  }

  successResponse(res, 201, `Bulk upload complete: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`, results);
});

module.exports = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  bulkCreateSubcategories
};

const Brand = require('./brand.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createBrand = asyncHandler(async (req, res) => {
  const { name, code, description, logo, website } = req.body;

  const existingBrand = await Brand.findOne({ $or: [{ name }, { code }] });

  if (existingBrand) {
    throw new ValidationError('Brand with this name or code already exists');
  }

  const brand = await Brand.create({ name, code, description, logo, website });

  successResponse(res, 201, 'Brand created successfully', brand);
});

const getAllBrands = asyncHandler(async (req, res) => {
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
  const brands = await Brand.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  const total = await Brand.countDocuments(query);

  successResponse(res, 200, 'Brands retrieved successfully', {
    brands,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new NotFoundError('Brand not found');
  }

  successResponse(res, 200, 'Brand retrieved successfully', brand);
});

const updateBrand = asyncHandler(async (req, res) => {
  const { name, code, description, logo, website, isActive } = req.body;

  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new NotFoundError('Brand not found');
  }

  if (name || code) {
    const existingBrand = await Brand.findOne({
      _id: { $ne: req.params.id },
      $or: [...(name ? [{ name }] : []), ...(code ? [{ code }] : [])]
    });

    if (existingBrand) {
      throw new ValidationError('Brand with this name or code already exists');
    }
  }

  if (name) brand.name = name;
  if (code) brand.code = code;
  if (description !== undefined) brand.description = description;
  if (logo !== undefined) brand.logo = logo;
  if (website !== undefined) brand.website = website;
  if (isActive !== undefined) brand.isActive = isActive;

  await brand.save();

  successResponse(res, 200, 'Brand updated successfully', brand);
});

const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new NotFoundError('Brand not found');
  }

  await brand.deleteOne();

  successResponse(res, 200, 'Brand deleted successfully', null);
});

const bulkCreateBrands = asyncHandler(async (req, res) => {
  const rows = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must be a non-empty array' });
  }

  const created = [];
  const skipped = [];
  const errors = [];

  for (const row of rows) {
    const { name, code, description, logo, website } = row;
    if (!name || !code) {
      errors.push({ row, reason: 'name and code are required' });
      continue;
    }
    try {
      const existing = await Brand.findOne({ $or: [{ name }, { code }] });
      if (existing) {
        skipped.push({ name, code, reason: 'already exists' });
        continue;
      }
      const brand = await Brand.create({ name, code, description, logo, website });
      created.push(brand);
    } catch (err) {
      errors.push({ row, reason: err.message });
    }
  }

  successResponse(res, 201, `Bulk create complete: ${created.length} created, ${skipped.length} skipped`, {
    created, skipped, errors
  });
});

module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  bulkCreateBrands
};

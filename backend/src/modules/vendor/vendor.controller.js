const Vendor = require('./vendor.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createVendor = asyncHandler(async (req, res) => {
  const { name, email, phone, address, city, country, supplierCode,
          rating, responseRate, hasGST, gstNumber, location, locality,
          memberSince, minOrderQty, variety, isB2BVendor } = req.body;

  const vendor = await Vendor.create({
    name, email, phone, address, city, country, supplierCode,
    rating, responseRate, hasGST, gstNumber, location, locality,
    memberSince, minOrderQty, variety, isB2BVendor: isB2BVendor !== false
  });

  successResponse(res, 201, 'Vendor created successfully', vendor);
});

const getAllVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, search, isActive } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { supplierCode: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const vendors = await Vendor.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  const total = await Vendor.countDocuments(query);

  successResponse(res, 200, 'Vendors retrieved successfully', {
    vendors,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  successResponse(res, 200, 'Vendor retrieved successfully', vendor);
});

const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const fields = ['name', 'email', 'phone', 'address', 'city', 'country',
                  'supplierCode', 'rating', 'responseRate', 'hasGST', 'gstNumber',
                  'location', 'locality', 'memberSince', 'minOrderQty', 'variety',
                  'isB2BVendor', 'isActive'];

  fields.forEach(field => {
    if (req.body[field] !== undefined) vendor[field] = req.body[field];
  });

  await vendor.save();

  successResponse(res, 200, 'Vendor updated successfully', vendor);
});

const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  await vendor.deleteOne();

  successResponse(res, 200, 'Vendor deleted successfully', null);
});

const bulkCreateVendors = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Request body must be a non-empty array of vendors');
  }

  const results = { created: [], skipped: [], errors: [] };

  for (let i = 0; i < items.length; i++) {
    const {
      name, email, phone, address, city, country, supplierCode,
      rating, responseRate, hasGST, gstNumber, location, locality,
      memberSince, minOrderQty, variety, isB2BVendor, isActive
    } = items[i];

    if (!name) {
      results.errors.push({ index: i, reason: 'name is required', item: items[i] });
      continue;
    }

    const dupQuery = [{ name }];
    if (supplierCode) dupQuery.push({ supplierCode });
    const existing = await Vendor.findOne({ $or: dupQuery });
    if (existing) {
      results.skipped.push({ index: i, reason: 'Duplicate vendor name or supplier code', item: items[i] });
      continue;
    }

    try {
      const vendor = await Vendor.create({
        name, email, phone, address, city: city || undefined,
        country: country || 'India', supplierCode: supplierCode || undefined,
        rating: rating || 4.0, responseRate: responseRate !== undefined ? responseRate : 100,
        hasGST: ['yes', 'true', '1', true].includes(typeof hasGST === 'string' ? hasGST.toLowerCase() : hasGST),
        gstNumber: gstNumber || undefined,
        location: location || undefined, locality: locality || undefined,
        memberSince: memberSince || undefined,
        minOrderQty: minOrderQty || 1, variety: variety || undefined,
        isB2BVendor: isB2BVendor !== false,
        isActive: isActive !== undefined ? ['yes', 'true', '1', true].includes(typeof isActive === 'string' ? isActive.toLowerCase() : isActive) : true
      });
      results.created.push(vendor);
    } catch (err) {
      results.errors.push({ index: i, reason: err.message, item: items[i] });
    }
  }

  successResponse(res, 201, `Bulk upload complete: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`, results);
});

module.exports = { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor, bulkCreateVendors };

const Banner = require('./banner.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { BadRequestError, NotFoundError } = require('../../utils/customErrors');

/**
 * @desc    Create new banner
 * @route   POST /api/banners/create
 * @access  Private/Admin
 */
exports.createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  successResponse(res, 201, 'Banner created successfully', banner);
});

/**
 * @desc    Get all banners with pagination
 * @route   GET /api/banners
 * @access  Public
 */
exports.getAllBanners = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter by active status if provided
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  // Search functionality
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { subtitle: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await Banner.countDocuments(query);
  const banners = await Banner.find(query)
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse(res, 200, 'Banners retrieved successfully', {
    banners,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  });
});

/**
 * @desc    Get banner by ID
 * @route   GET /api/banners/:id
 * @access  Public
 */
exports.getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    throw new NotFoundError('Banner not found');
  }

  successResponse(res, 200, 'Banner retrieved successfully', banner);
});

/**
 * @desc    Update banner
 * @route   PUT /api/banners/:id
 * @access  Private/Admin
 */
exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!banner) {
    throw new NotFoundError('Banner not found');
  }

  successResponse(res, 200, 'Banner updated successfully', banner);
});

/**
 * @desc    Delete banner
 * @route   DELETE /api/banners/:id
 * @access  Private/Admin
 */
exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    throw new NotFoundError('Banner not found');
  }

  successResponse(res, 200, 'Banner deleted successfully');
});

/**
 * @desc    Get active banners (for frontend display)
 * @route   GET /api/banners/active
 * @access  Public
 */
exports.getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(10);

  successResponse(res, 200, 'Active banners retrieved successfully', banners);
});

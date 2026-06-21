const Wishlist = require('./wishlist.model');
const Product = require('../product/product.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { BadRequestError, NotFoundError } = require('../../utils/customErrors');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getUserWishlist = asyncHandler(async (req, res) => {
  const wishlistItems = await Wishlist.find({ user: req.user.id })
    .populate({
      path: 'product',
      select: 'name price images discountType discountValue quantity itemCode brand category',
      populate: [
        { path: 'brand', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: wishlistItems
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new BadRequestError('Product ID is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Check if already in wishlist
  const existingItem = await Wishlist.findOne({
    user: req.user.id,
    product: productId
  });

  if (existingItem) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      data: existingItem
    });
  }

  // Add to wishlist
  const wishlistItem = await Wishlist.create({
    user: req.user.id,
    product: productId
  });

  const populatedItem = await Wishlist.findById(wishlistItem._id)
    .populate({
      path: 'product',
      select: 'name price images discountType discountValue quantity itemCode brand category',
      populate: [
        { path: 'brand', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    });

  res.status(201).json({
    success: true,
    message: 'Product added to wishlist',
    data: populatedItem
  });
});

// @desc    Add multiple products to wishlist (for sync from IndexedDB)
// @route   POST /api/wishlist/bulk
// @access  Private
const addBulkToWishlist = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError('Product IDs array is required');
  }

  const results = {
    added: [],
    existing: [],
    notFound: []
  };

  for (const productId of productIds) {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      results.notFound.push(productId);
      continue;
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user.id,
      product: productId
    });

    if (existingItem) {
      results.existing.push(productId);
    } else {
      const wishlistItem = await Wishlist.create({
        user: req.user.id,
        product: productId
      });
      results.added.push(productId);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Bulk wishlist sync completed',
    data: results
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlistItem = await Wishlist.findOneAndDelete({
    user: req.user.id,
    product: productId
  });

  if (!wishlistItem) {
    throw new NotFoundError('Product not found in wishlist');
  }

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist'
  });
});

// @desc    Clear user's wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.deleteMany({ user: req.user.id });

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared'
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlistItem = await Wishlist.findOne({
    user: req.user.id,
    product: productId
  });

  res.status(200).json({
    success: true,
    data: {
      isInWishlist: !!wishlistItem
    }
  });
});

module.exports = {
  getUserWishlist,
  addToWishlist,
  addBulkToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
};

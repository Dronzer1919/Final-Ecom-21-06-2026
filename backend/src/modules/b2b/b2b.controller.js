const { B2BSection, B2BCategory, B2BCatalogProduct, B2BMarketplaceProduct } = require('./b2b.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { NotFoundError } = require('../../utils/customErrors');

// ─── Sections ─────────────────────────────────────────────────────────────────

const getAllSections = asyncHandler(async (req, res) => {
  const sections = await B2BSection.find({ isActive: true }).sort({ createdAt: 1 });
  successResponse(res, 200, 'Sections retrieved successfully', sections);
});

const getSectionById = asyncHandler(async (req, res) => {
  const section = await B2BSection.findOne({ sectionId: req.params.sectionId, isActive: true });
  if (!section) throw new NotFoundError('Section not found');
  successResponse(res, 200, 'Section retrieved successfully', section);
});

// ─── Categories ───────────────────────────────────────────────────────────────

const getAllCategories = asyncHandler(async (req, res) => {
  const { sectionId } = req.query;
  const query = { isActive: true };
  if (sectionId) query.sectionId = sectionId;
  const categories = await B2BCategory.find(query).sort({ createdAt: 1 });
  successResponse(res, 200, 'Categories retrieved successfully', categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await B2BCategory.findOne({ categoryId: req.params.categoryId, isActive: true });
  if (!category) throw new NotFoundError('Category not found');
  successResponse(res, 200, 'Category retrieved successfully', category);
});

// ─── Catalog Products ──────────────────────────────────────────────────────────

const getCatalogProducts = asyncHandler(async (req, res) => {
  const { categoryId, subcategoryId, search } = req.query;
  const query = { isActive: true };
  if (categoryId)    query.categoryId    = categoryId;
  if (subcategoryId) query.subcategoryId = subcategoryId;
  if (search)        query.productName   = { $regex: search, $options: 'i' };
  const products = await B2BCatalogProduct.find(query).sort({ productId: 1 });
  successResponse(res, 200, 'Catalog products retrieved successfully', products);
});

const getCatalogProductById = asyncHandler(async (req, res) => {
  const product = await B2BCatalogProduct.findOne({ productId: req.params.productId, isActive: true });
  if (!product) throw new NotFoundError('Product not found');
  successResponse(res, 200, 'Product retrieved successfully', product);
});

// ─── Marketplace Products (listings by productId) ─────────────────────────────

const getMarketplaceListings = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { city, minPrice, maxPrice, variety } = req.query;

  const query = { productId, isActive: true };
  if (variety) query.variety = { $regex: variety, $options: 'i' };
  if (city)    query['supplier.location'] = { $regex: city, $options: 'i' };
  if (minPrice || maxPrice) {
    query['supplier.price'] = {};
    if (minPrice) query['supplier.price'].$gte = parseFloat(minPrice);
    if (maxPrice) query['supplier.price'].$lte = parseFloat(maxPrice);
  }

  const listings = await B2BMarketplaceProduct.find(query).sort({ 'supplier.rating': -1 });
  
  // If no listings found for productId, return 404 info but empty array  
  successResponse(res, 200, 'Marketplace listings retrieved successfully', listings);
});

// ─── Full B2B Catalog (sections + categories + products in one call) ───────────

const getFullCatalog = asyncHandler(async (req, res) => {
  const [sections, categories, products] = await Promise.all([
    B2BSection.find({ isActive: true }).sort({ createdAt: 1 }),
    B2BCategory.find({ isActive: true }).sort({ createdAt: 1 }),
    B2BCatalogProduct.find({ isActive: true }).sort({ productId: 1 })
  ]);
  successResponse(res, 200, 'Full B2B catalog retrieved successfully', { sections, categories, products });
});

module.exports = {
  getAllSections,
  getSectionById,
  getAllCategories,
  getCategoryById,
  getCatalogProducts,
  getCatalogProductById,
  getMarketplaceListings,
  getFullCatalog
};

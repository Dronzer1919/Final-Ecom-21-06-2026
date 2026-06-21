const mongoose = require('mongoose');

// ─── B2B Section ─────────────────────────────────────────────────────────────
const b2bSectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true, unique: true, trim: true },
  name:      { type: String, required: true, trim: true },
  icon:      { type: String, default: '' },
  description: { type: String, default: '' },
  categoryIds: [{ type: String }],
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

// ─── B2B Subcategory (embedded in Category) ───────────────────────────────────
const b2bSubcategorySchema = new mongoose.Schema({
  subcategoryId: { type: String, required: true, trim: true },
  name:   { type: String, required: true, trim: true },
  icon:   { type: String, default: '' },
  categoryId: { type: String, required: true, trim: true },
  productIds: [{ type: String }]
}, { _id: false });

// ─── B2B Category ─────────────────────────────────────────────────────────────
const b2bCategorySchema = new mongoose.Schema({
  categoryId:   { type: String, required: true, unique: true, trim: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  icon:         { type: String, default: '' },
  sectionId:    { type: String, required: true, trim: true },
  subcategories: [b2bSubcategorySchema],
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

// ─── B2B Catalog Product ──────────────────────────────────────────────────────
// Lightweight catalog entry shown in the categories/listing page
const b2bCatalogProductSchema = new mongoose.Schema({
  productId:    { type: String, required: true, unique: true, trim: true },
  productName:  { type: String, required: true, trim: true },
  category:     { type: String, required: true, trim: true },
  categoryId:   { type: String, required: true, trim: true },
  subcategoryId:{ type: String, required: true, trim: true },
  image:        { type: String, default: '' },
  vendorCount:  { type: Number, default: 0 },
  priceRange:   {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  unit:         { type: String, default: 'Kg' },
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

// ─── Bulk Price Tier ──────────────────────────────────────────────────────────
const bulkPriceSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit:     { type: String, required: true },
  price:    { type: Number, required: true },
  discount: { type: Number, default: 0 }
}, { _id: false });

// ─── B2B Marketplace Product ──────────────────────────────────────────────────
// One record per product-supplier combination
const b2bMarketplaceProductSchema = new mongoose.Schema({
  productId:   { type: String, required: true, trim: true, index: true },
  productName: { type: String, required: true, trim: true },
  category:    { type: String, required: true, trim: true },
  variety:     { type: String, default: '' },
  image:       { type: String, default: '' },
  supplier: {
    supplierId:   { type: String, required: true, trim: true },
    supplierName: { type: String, required: true, trim: true },
    rating:       { type: Number, default: 4.0, min: 0, max: 5 },
    reviewCount:  { type: Number, default: 0 },
    price:        { type: Number, required: true },
    unit:         { type: String, default: 'Kg' },
    location:     { type: String, default: '' },
    responseRate: { type: Number, default: 100, min: 0, max: 100 },
    hasGST:       { type: Boolean, default: true },
    hasEmail:     { type: Boolean, default: true },
    hasMobile:    { type: Boolean, default: true },
    memberSince:  { type: String, default: '' },
    bulkPricing:  [bulkPriceSchema]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const B2BSection           = mongoose.model('B2BSection',           b2bSectionSchema);
const B2BCategory          = mongoose.model('B2BCategory',          b2bCategorySchema);
const B2BCatalogProduct    = mongoose.model('B2BCatalogProduct',    b2bCatalogProductSchema);
const B2BMarketplaceProduct= mongoose.model('B2BMarketplaceProduct',b2bMarketplaceProductSchema);

module.exports = { B2BSection, B2BCategory, B2BCatalogProduct, B2BMarketplaceProduct };

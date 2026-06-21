const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for creating a product
exports.createProductValidation = [
  // Store & Warehouse
  body('store')
    .trim()
    .notEmpty()
    .withMessage('Store is required'),
  
  body('warehouse')
    .trim()
    .notEmpty()
    .withMessage('Warehouse is required'),
  
  // Product Type
  body('productType')
    .optional()
    .isIn(['single', 'variable'])
    .withMessage('Product type must be either single or variable'),
  
  // Basic Information
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Slug cannot exceed 250 characters'),
  
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
  
  body('sellingType')
    .trim()
    .notEmpty()
    .withMessage('Selling type is required'),
  
  // Category Information
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('subCategory')
    .trim()
    .notEmpty()
    .withMessage('Sub-category is required'),
  
  body('brand')
    .optional()
    .trim(),
  
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  
  // Code & Barcode
  body('itemCode')
    .trim()
    .notEmpty()
    .withMessage('Item code is required'),
  
  body('barcodeSymbology')
    .trim()
    .notEmpty()
    .withMessage('Barcode symbology is required'),
  
  // Description
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  // Images
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  // Pricing & Stock
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .isInt({ min: 0 })
    .withMessage('Quantity must be greater than or equal to 0'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  // Tax & Discount
  body('taxType')
    .trim()
    .notEmpty()
    .withMessage('Tax type is required'),
  
  body('discountType')
    .trim()
    .notEmpty()
    .withMessage('Discount type is required'),
  
  body('discountValue')
    .optional()
    .isNumeric()
    .withMessage('Discount value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be greater than or equal to 0'),
  
  // Alert & Status
  body('quantityAlert')
    .isNumeric()
    .withMessage('Quantity alert must be a number')
    .isInt({ min: 0 })
    .withMessage('Quantity alert must be greater than or equal to 0'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
  
  // Warranty & Manufacturing
  body('warranty')
    .optional()
    .trim(),
  
  body('manufacturer')
    .optional()
    .trim(),
  
  body('manufacturedDate')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Manufactured date must be a valid date'),
  
  body('expiryOn')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Expiry date must be a valid date')
];

// Validation rules for updating a product
exports.updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('store')
    .optional()
    .trim(),
  
  body('warehouse')
    .optional()
    .trim(),
  
  body('productType')
    .optional()
    .isIn(['single', 'variable'])
    .withMessage('Product type must be either single or variable'),
  
  body('productName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Slug cannot exceed 250 characters'),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
  
  body('sellingType')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  
  body('subCategory')
    .optional()
    .trim(),
  
  body('brand')
    .optional()
    .trim(),
  
  body('unit')
    .optional()
    .trim(),
  
  body('itemCode')
    .optional()
    .trim(),
  
  body('barcodeSymbology')
    .optional()
    .trim(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  body('taxType')
    .optional()
    .trim(),
  
  body('discountType')
    .optional()
    .trim(),
  
  body('discountValue')
    .optional()
    .isNumeric()
    .withMessage('Discount value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be greater than or equal to 0'),
  
  body('quantityAlert')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity alert must be a non-negative integer'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
  
  body('warranty')
    .optional()
    .trim(),
  
  body('manufacturer')
    .optional()
    .trim(),
  
  body('manufacturedDate')
    .optional()
    .isISO8601()
    .withMessage('Manufactured date must be a valid date'),
  
  body('expiryOn')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];

// Validation rules for getting product by ID
exports.getProductByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Validation rules for deleting a product
exports.deleteProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Validation rules for query parameters
exports.queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('sortBy')
    .optional()
    .isIn(['productName', 'price', 'quantity', 'category', 'brand', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  
  query('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive')
];

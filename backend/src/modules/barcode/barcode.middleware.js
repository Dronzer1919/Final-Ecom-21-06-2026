const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const createBarcodeValidation = [
  body('name').trim().notEmpty().withMessage('Barcode symbology name is required').isLength({ min: 2, max: 100 }).withMessage('Barcode symbology name must be between 2 and 100 characters'),
  body('code').trim().notEmpty().withMessage('Barcode symbology code is required').isLength({ min: 2, max: 20 }).withMessage('Barcode symbology code must be between 2 and 20 characters'),
  body('description').optional().trim()
];

const updateBarcodeValidation = [
  param('id').isMongoId().withMessage('Invalid barcode symbology ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Barcode symbology name must be between 2 and 100 characters'),
  body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Barcode symbology code must be between 2 and 20 characters'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const getBarcodeByIdValidation = [
  param('id').isMongoId().withMessage('Invalid barcode symbology ID')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false')
];

module.exports = {
  validate,
  createBarcodeValidation,
  updateBarcodeValidation,
  getBarcodeByIdValidation,
  queryValidation
};

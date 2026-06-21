const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const createVendorValidation = [
  body('name').trim().notEmpty().withMessage('Vendor name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Vendor name must be between 2 and 100 characters'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('supplierCode').optional().trim(),
  body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('responseRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Response rate must be between 0 and 100'),
  body('hasGST').optional().isBoolean().withMessage('hasGST must be a boolean'),
  body('gstNumber').optional().trim(),
  body('minOrderQty').optional().isInt({ min: 1 }).withMessage('Min order qty must be at least 1')
];

const updateVendorValidation = [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Vendor name must be between 2 and 100 characters'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('supplierCode').optional().trim(),
  body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('responseRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Response rate must be between 0 and 100'),
  body('hasGST').optional().isBoolean().withMessage('hasGST must be a boolean'),
  body('gstNumber').optional().trim(),
  body('minOrderQty').optional().isInt({ min: 1 }).withMessage('Min order qty must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const getVendorByIdValidation = [
  param('id').isMongoId().withMessage('Invalid vendor ID')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false')
];

module.exports = {
  validate,
  createVendorValidation,
  updateVendorValidation,
  getVendorByIdValidation,
  queryValidation
};

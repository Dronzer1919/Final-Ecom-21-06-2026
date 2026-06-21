const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const createBrandValidation = [
  body('name').trim().notEmpty().withMessage('Brand name is required').isLength({ min: 2, max: 100 }).withMessage('Brand name must be between 2 and 100 characters'),
  body('code').trim().notEmpty().withMessage('Brand code is required').isLength({ min: 2, max: 20 }).withMessage('Brand code must be between 2 and 20 characters'),
  body('description').optional().trim(),
  body('logo').optional().trim().custom((value) => {
    if (!value) return true;
    // Allow base64 data URLs or regular URLs
    if (value.startsWith('data:image/')) return true;
    try {
      new URL(value);
      return true;
    } catch {
      throw new Error('Invalid logo URL or base64 image');
    }
  }),
  body('website').optional().trim().isURL().withMessage('Invalid website URL')
];

const updateBrandValidation = [
  param('id').isMongoId().withMessage('Invalid brand ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Brand name must be between 2 and 100 characters'),
  body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Brand code must be between 2 and 20 characters'),
  body('description').optional().trim(),
  body('logo').optional().trim().custom((value) => {
    if (!value) return true;
    // Allow base64 data URLs or regular URLs
    if (value.startsWith('data:image/')) return true;
    try {
      new URL(value);
      return true;
    } catch {
      throw new Error('Invalid logo URL or base64 image');
    }
  }),
  body('website').optional().trim().isURL().withMessage('Invalid website URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const getBrandByIdValidation = [
  param('id').isMongoId().withMessage('Invalid brand ID')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false')
];

module.exports = {
  validate,
  createBrandValidation,
  updateBrandValidation,
  getBrandByIdValidation,
  queryValidation
};

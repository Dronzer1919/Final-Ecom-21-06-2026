const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
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

const createWarehouseValidation = [
  body('name').trim().notEmpty().withMessage('Warehouse name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Warehouse name must be between 2 and 100 characters'),
  body('code').trim().notEmpty().withMessage('Warehouse code is required')
    .isLength({ min: 2, max: 20 }).withMessage('Warehouse code must be between 2 and 20 characters')
    .isAlphanumeric().withMessage('Warehouse code must contain only letters and numbers'),
  body('phone').optional({ checkFalsy: true }).trim().isMobilePhone().withMessage('Invalid phone number'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Invalid email address'),
  body('capacity').optional({ checkFalsy: true }).isNumeric().withMessage('Capacity must be a number'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.zipCode').optional().trim()
];

const updateWarehouseValidation = [
  param('id').isMongoId().withMessage('Invalid warehouse ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Warehouse name must be between 2 and 100 characters'),
  body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Warehouse code must be between 2 and 20 characters')
    .isAlphanumeric().withMessage('Warehouse code must contain only letters and numbers'),
  body('phone').optional({ checkFalsy: true }).trim().isMobilePhone().withMessage('Invalid phone number'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Invalid email address'),
  body('capacity').optional({ checkFalsy: true }).isNumeric().withMessage('Capacity must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.zipCode').optional().trim()
];

const getWarehouseByIdValidation = [
  param('id').isMongoId().withMessage('Invalid warehouse ID')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false')
];

module.exports = {
  validate,
  createWarehouseValidation,
  updateWarehouseValidation,
  getWarehouseByIdValidation,
  queryValidation
};

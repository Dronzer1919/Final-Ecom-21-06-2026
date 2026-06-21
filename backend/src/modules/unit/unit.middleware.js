const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const createUnitValidation = [
  body('name').trim().notEmpty().withMessage('Unit name is required').isLength({ min: 2, max: 100 }).withMessage('Unit name must be between 2 and 100 characters'),
  body('shortName').trim().notEmpty().withMessage('Short name is required').isLength({ min: 1, max: 10 }).withMessage('Short name must be between 1 and 10 characters'),
  body('description').optional().trim()
];

const updateUnitValidation = [
  param('id').isMongoId().withMessage('Invalid unit ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Unit name must be between 2 and 100 characters'),
  body('shortName').optional().trim().isLength({ min: 1, max: 10 }).withMessage('Short name must be between 1 and 10 characters'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const getUnitByIdValidation = [
  param('id').isMongoId().withMessage('Invalid unit ID')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false')
];

module.exports = {
  validate,
  createUnitValidation,
  updateUnitValidation,
  getUnitByIdValidation,
  queryValidation
};
